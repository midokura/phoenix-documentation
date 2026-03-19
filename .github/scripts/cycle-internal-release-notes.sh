#!/usr/bin/env bash
set -euo pipefail

: "${RC_VERSION:?RC_VERSION is required}"

MINOR_VERSION="${RC_VERSION%-rc*}"
RC_NUM="${RC_VERSION##*-rc}"
NEXT_RC_NUM=$((RC_NUM + 1))
NEXT_RC_VERSION="${MINOR_VERSION}-rc${NEXT_RC_NUM}"

OLD_PR_TITLE="add[release notes]: add v${RC_VERSION} release notes"
NEW_PR_TITLE="add[release notes]: add v${NEXT_RC_VERSION} release notes"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BLOG_FILE="${REPO_ROOT}/blog/.next-ai-factory-${MINOR_VERSION}.md"

# Merge old PR if it exists
OLD_PR_NUMBER=$(gh pr list --state open --json number,title \
    | jq -r ".[] | select(.title == \"${OLD_PR_TITLE}\") | .number")

MERGED_COMMIT=""
if [[ -n "$OLD_PR_NUMBER" ]]; then
    echo "Merging PR #${OLD_PR_NUMBER}: ${OLD_PR_TITLE}"
    gh pr merge "$OLD_PR_NUMBER" --squash --delete-branch
    MERGED_COMMIT=$(gh pr view "$OLD_PR_NUMBER" --json mergeCommit --jq '.mergeCommit.oid')
    echo "Merged commit: ${MERGED_COMMIT}"
else
    echo "No open PR found with title: ${OLD_PR_TITLE} — skipping merge"
fi

# Create new draft PR for next RC (skip if it already exists)
NEW_BRANCH="add-release-notes-${NEXT_RC_VERSION}"

EXISTING_PR_NUMBER=$(gh pr list --state open --json number,title \
    | jq -r ".[] | select(.title == \"${NEW_PR_TITLE}\") | .number")

if [[ -n "$EXISTING_PR_NUMBER" ]]; then
    echo "Draft PR for ${NEXT_RC_VERSION} already exists (#${EXISTING_PR_NUMBER}) — skipping"
    NEW_PR_URL=$(gh pr view "$EXISTING_PR_NUMBER" --json url --jq '.url')
else
    git fetch origin main
    git checkout -b "$NEW_BRANCH" origin/main

    if [[ ! -f "$BLOG_FILE" ]]; then
        echo "error: blog file not found: ${BLOG_FILE}" >&2
        exit 1
    fi

    sed -i "s/^## Operator reference/### Feature 1\n\nPut your changes here\n\n## Operator reference/" "$BLOG_FILE"

    git add "$BLOG_FILE"
    git commit -m "${NEW_PR_TITLE}"
    git push origin "$NEW_BRANCH"

    NEW_PR_URL=$(gh pr create \
        --title "$NEW_PR_TITLE" \
        --body "Draft release notes for v${NEXT_RC_VERSION}." \
        --base main \
        --head "$NEW_BRANCH" \
        --draft)
fi

echo "new_pr_url=${NEW_PR_URL}" >> "$GITHUB_OUTPUT"
echo "new_rc_version=${NEXT_RC_VERSION}" >> "$GITHUB_OUTPUT"
echo "merged_commit=${MERGED_COMMIT}" >> "$GITHUB_OUTPUT"
