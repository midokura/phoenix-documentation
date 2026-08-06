#!/usr/bin/env bash
set -euo pipefail

: "${VERSION:?VERSION is required}"

if [[ ! "$VERSION" =~ ^v[0-9]+\.[0-9]+\.[0-9]+.*$ ]]; then
    echo "error: VERSION must start with 'v' and match vXX.Y.N format (got: ${VERSION})" >&2
    exit 1
fi

RELEASE_NOTES_TITLE="add[release notes]: add ${VERSION} release notes"

PR_JSON=$(gh pr list --state all --json number,isDraft,title,state \
    | jq -r ".[] | select(.title == \"${RELEASE_NOTES_TITLE}\")")

if [[ -z "$PR_JSON" ]]; then
    echo "error: no PR found with title: ${RELEASE_NOTES_TITLE}" >&2
    exit 1
fi

PR_NUMBER=$(echo "$PR_JSON" | jq -r '.number')
PR_STATE=$(echo "$PR_JSON" | jq -r '.state')
IS_DRAFT=$(echo "$PR_JSON" | jq -r '.isDraft')

# The release pipeline in phoenix-release-ops waits for this PR to be merged
# before dispatching us, so MERGED is the normal case. Only the merge is
# skipped: the versioned docs snapshot below still has to happen.
if [[ "$PR_STATE" == "MERGED" ]]; then
    echo "PR #${PR_NUMBER} is already merged, skipping the merge step."
else
    if [[ "$IS_DRAFT" == "true" ]]; then
        echo "error: PR #${PR_NUMBER} is in draft mode" >&2
        exit 1
    fi

    gh pr merge "$PR_NUMBER" --squash --delete-branch
fi

git fetch origin main

if git show "origin/main:versions.json" | jq -e --arg v "$VERSION" 'index($v)' >/dev/null; then
    echo "Version ${VERSION} is already in versions.json. Nothing left to do."
    exit 0
fi

DOCS_BRANCH="add-docs-version-${VERSION}"
DOCS_PR_TITLE="docs: add versioned snapshot for ${VERSION}"

# An earlier attempt may have already opened the snapshot PR and then failed to
# merge it. Reuse it rather than trying to recreate a branch that exists.
DOCS_PR_NUMBER=$(gh pr list --state open --limit 200 --json number,title \
    | jq -r "[.[] | select(.title == \"${DOCS_PR_TITLE}\")] | first.number // empty")

if [[ -n "$DOCS_PR_NUMBER" ]]; then
    echo "Reusing open snapshot PR #${DOCS_PR_NUMBER}"
else
    git checkout -b "$DOCS_BRANCH" origin/main

    yarn install --frozen-lockfile
    yarn docusaurus docs:version "$VERSION"

    git add .
    git commit -m "${DOCS_PR_TITLE}"
    git push origin "$DOCS_BRANCH"

    DOCS_PR_URL=$(gh pr create \
        --title "${DOCS_PR_TITLE}" \
        --body "Automated versioned docs snapshot for ${VERSION}." \
        --base main \
        --head "$DOCS_BRANCH")

    DOCS_PR_NUMBER=$(basename "$DOCS_PR_URL")
fi

# Merge directly rather than with --auto. The release bot is a bypass actor on
# the main ruleset, but auto-merge does not exercise bypass: it waits for every
# merge requirement to be satisfied, including the code owner review that a
# generated snapshot will never receive. A direct merge does use the bypass,
# which is how cycle-internal-release-notes.sh has always merged its PRs.
gh pr merge "$DOCS_PR_NUMBER" --squash --delete-branch

STATE=$(gh pr view "$DOCS_PR_NUMBER" --json state --jq '.state')
if [[ "$STATE" != "MERGED" ]]; then
    echo "error: PR #${DOCS_PR_NUMBER} was not merged (state: ${STATE})" >&2
    exit 1
fi

echo "Merged versioned docs snapshot PR #${DOCS_PR_NUMBER} for ${VERSION}"
