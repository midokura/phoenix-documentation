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
git checkout -b "$DOCS_BRANCH" origin/main

yarn install --frozen-lockfile
yarn docusaurus docs:version "$VERSION"

git add .
git commit -m "docs: add versioned snapshot for ${VERSION}"
git push origin "$DOCS_BRANCH"

DOCS_PR_URL=$(gh pr create \
    --title "docs: add versioned snapshot for ${VERSION}" \
    --body "Automated versioned docs snapshot for ${VERSION}." \
    --base main \
    --head "$DOCS_BRANCH")

DOCS_PR_NUMBER=$(basename "$DOCS_PR_URL")

gh pr merge "$DOCS_PR_NUMBER" --auto --squash

TIMEOUT=300
ELAPSED=0
while [[ $ELAPSED -lt $TIMEOUT ]]; do
    STATE=$(gh pr view "$DOCS_PR_NUMBER" --json state --jq '.state')
    [[ "$STATE" == "MERGED" ]] && break
    sleep 10
    ELAPSED=$((ELAPSED + 10))
done

if [[ "$STATE" != "MERGED" ]]; then
    echo "error: PR #${DOCS_PR_NUMBER} did not merge within ${TIMEOUT}s (state: ${STATE})" >&2
    exit 1
fi
