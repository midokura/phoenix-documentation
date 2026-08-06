#!/usr/bin/env bash
#
# create-release-notes-pr.sh
#
# Opens the release notes PR for a public release: a skeleton blog post and a
# matching upgrade guide, which humans fill in before merging.
#
# The PR title is an API contract with publish-release-notes.sh, which looks the
# PR up by exact title match. Do not change the format without changing both.
#
# Environment variables:
#   VERSION   Release version with the v prefix, e.g. v25.1.6 (required)
#   GH_TOKEN  GitHub token with contents and pull-requests write access (required)
#
set -euo pipefail

log() { echo "==> $*" >&2; }
die() { echo "ERROR: $*" >&2; exit 1; }

: "${VERSION:?VERSION is required}"

if [[ ! "$VERSION" =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    die "VERSION must start with 'v' and match vXX.Y.N format (got: ${VERSION})"
fi

BARE_VERSION="${VERSION#v}"
PR_TITLE="add[release notes]: add ${VERSION} release notes"
BRANCH="release_notes_${BARE_VERSION}"

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
RELEASE_NOTES_FILE="${REPO_ROOT}/blog/${VERSION}-releasenotes.md"
UPGRADE_GUIDE_FILE="${REPO_ROOT}/upgrade-guide/${VERSION}-upgradeguide.md"

emit_outputs() {
    local url="$1" number="$2"
    if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
        echo "pr_url=${url}" >> "$GITHUB_OUTPUT"
        echo "pr_number=${number}" >> "$GITHUB_OUTPUT"
    fi
}

# Idempotency gate: re-running the release workflow must not open a duplicate.
# --state all is deliberate. A PR that was closed without merging is a decision
# someone made on purpose, so surface it rather than quietly opening a new one.
EXISTING_PR=$(gh pr list --state all --limit 200 --json number,url,title \
    | jq -r "[.[] | select(.title == \"${PR_TITLE}\")] | first // empty")

if [[ -n "$EXISTING_PR" ]]; then
    PR_NUMBER=$(echo "$EXISTING_PR" | jq -r '.number')
    PR_URL=$(echo "$EXISTING_PR" | jq -r '.url')
    log "Release notes PR already exists: #${PR_NUMBER} ${PR_URL}"
    emit_outputs "$PR_URL" "$PR_NUMBER"
    exit 0
fi

# The upgrade guide states what you are upgrading from. There is no previous
# patch to name when this is the .0 of a new series.
SERIES="${BARE_VERSION%.*}"
PATCH="${BARE_VERSION##*.}"
PREVIOUS_VERSION=""
if (( PATCH > 0 )); then
    PREVIOUS_VERSION="${SERIES}.$((PATCH - 1))"
fi

TODAY=$(date +%Y-%m-%d)

log "Creating branch ${BRANCH} from origin/main"
git fetch origin main

# A leftover branch with no PR attached means an earlier run died between the
# push and the gh pr create. Nothing references it, so start clean.
if git ls-remote --exit-code --heads origin "$BRANCH" >/dev/null 2>&1; then
    log "Deleting stale branch ${BRANCH} left behind by an earlier run"
    git push origin --delete "$BRANCH"
fi

git checkout -B "$BRANCH" origin/main

log "Writing ${RELEASE_NOTES_FILE}"
cat > "$RELEASE_NOTES_FILE" <<EOF
---
slug: ${VERSION}
title: AIsware ${VERSION}
date: ${TODAY}
authors: [midoteam]
tags: [aisware]
---

Version ${BARE_VERSION} of AIsware is now available.

## Overview

<!-- TODO: replace with a short summary of this release before merging this PR. -->

<!-- truncate -->

## What's new

<!-- TODO: add one "### Headline" section per user visible change. -->
EOF

log "Writing ${UPGRADE_GUIDE_FILE}"
if [[ -n "$PREVIOUS_VERSION" ]]; then
    UPGRADE_BODY="No manual upgrade steps are required. Upgrading to ${BARE_VERSION} from ${PREVIOUS_VERSION} is a
drop-in replacement."
else
    UPGRADE_BODY="<!-- TODO: describe the upgrade steps for this release before merging this PR. -->"
fi

cat > "$UPGRADE_GUIDE_FILE" <<EOF
---
slug: ${VERSION}
title: Upgrade to ${VERSION}
date: ${TODAY}
authors: [midoteam]
tags: [aisware]
---

:::info

${UPGRADE_BODY}

:::

<!-- truncate -->
EOF

git add "$RELEASE_NOTES_FILE" "$UPGRADE_GUIDE_FILE"

if git diff --cached --quiet; then
    die "no changes staged for ${VERSION}, refusing to open an empty PR"
fi

git commit -m "${PR_TITLE}"
git push origin "$BRANCH"

PR_URL=$(gh pr create \
    --base main \
    --head "$BRANCH" \
    --title "$PR_TITLE" \
    --body "Skeleton release notes and upgrade guide for ${VERSION}.

Fill in the Overview, the \"What's new\" section, and any manual upgrade steps,
then merge. The release pipeline in phoenix-release-ops is blocked on this PR
and resumes automatically once it is merged.")

PR_NUMBER=$(basename "$PR_URL")
log "Opened release notes PR #${PR_NUMBER}: ${PR_URL}"
emit_outputs "$PR_URL" "$PR_NUMBER"
