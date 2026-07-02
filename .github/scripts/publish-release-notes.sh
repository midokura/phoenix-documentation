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

if [[ "$PR_STATE" == "MERGED" ]]; then
    echo "PR #${PR_NUMBER} is already merged. Nothing to do."
    exit 0
fi

if [[ "$IS_DRAFT" == "true" ]]; then
    echo "error: PR #${PR_NUMBER} is in draft mode" >&2
    exit 1
fi

gh pr merge "$PR_NUMBER" --squash --delete-branch

DOCS_BRANCH="add-docs-version-${VERSION}"
git fetch origin main
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

MERGE_TIME=$(gh pr view "$DOCS_PR_NUMBER" --json mergedAt --jq '.mergedAt')
echo "PR #${DOCS_PR_NUMBER} merged at ${MERGE_TIME}, waiting for deploy workflow..."

DEPLOY_TIMEOUT=600
DEPLOY_ELAPSED=0
DEPLOY_RUN_ID=""
while [[ $DEPLOY_ELAPSED -lt $DEPLOY_TIMEOUT ]]; do
    DEPLOY_RUN_ID=$(gh run list \
        --workflow=deploy.yml \
        --branch=main \
        --json databaseId,createdAt,status \
        --jq ".[] | select(.createdAt >= \"${MERGE_TIME}\") | .databaseId" \
        | head -1)
    [[ -n "$DEPLOY_RUN_ID" ]] && break
    sleep 10
    DEPLOY_ELAPSED=$((DEPLOY_ELAPSED + 10))
done

if [[ -z "$DEPLOY_RUN_ID" ]]; then
    echo "error: no deploy workflow run found after PR merge within ${DEPLOY_TIMEOUT}s" >&2
    exit 1
fi

echo "Found deploy run ${DEPLOY_RUN_ID}, waiting for it to complete..."
gh run watch "$DEPLOY_RUN_ID" --exit-status
