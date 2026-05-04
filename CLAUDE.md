# phoenix-documentation

Docusaurus-based documentation for the AI Factory solution, deployed as GitHub Pages at docs.midokura.com. Jira project: GPD.

## Project structure

```
docs/                        # Current ("next") docs — becomes the next versioned snapshot
versioned_docs/version-X.Y.Z # Frozen versioned snapshots
versioned_sidebars/          # Sidebar configs per version
blog/                        # Release notes (one file per release)
i18n/ja/                     # Japanese translations (mirrors blog/ and docs/ structure)
versions.json                # List of published versions (latest first)
```

Blog post templates and drafts are prefixed with `.` (e.g. `.YYYY-MM-DD-ai-factory-vX.X.md`) so Docusaurus ignores them.

## Docusaurus versioning — how URLs resolve

This site uses Docusaurus versioned docs. **The key rule:**

- `/docs/some-page` → resolves to the **latest versioned** docs (first entry in `versions.json`), NOT the current `docs/` directory
- `/docs/next/some-page` → the current `docs/` directory (unreleased / in-progress)
- `/docs/1.13.0/some-page` → a specific versioned snapshot

### Consequence when moving or renaming docs files

When a file moves within `docs/` (the current/next tree):

- **Historical blog posts** that link to `/docs/old-path` are **not broken** — they resolve to the latest versioned snapshot, which still has the file at the old location.
- **The upcoming release blog post** (`.next-ai-factory-X.Y.Z.md`) and **release note templates** (`.YYYY-MM-DD-ai-factory-vX.X.md`, `i18n/ja/.../.YYYY-MM-DD-aifactory-vX.X.md`) **must be updated** — they will be published alongside the next versioned snapshot, which will have the new file location.

Always check those three template/draft files when moving docs.

## Blog post link checklist (when moving a doc)

1. Search for the old path across `blog/` and `i18n/`:
   ```
   grep -r "old-path" blog/ i18n/
   ```
2. Identify which files are historical (already-versioned releases) vs. future (templates and next-release drafts).
3. Only update the future-facing files.

## Sidebar category entrypoints

A sidebar category can use a doc as its landing page instead of a generated index. Set this in the category's `_category_.json`:

```json
{
  "label": "Section Label",
  "position": 2,
  "link": {
    "type": "doc",
    "id": "section-folder/DOC_ID"
  }
}
```

The `id` is the doc's path relative to `docs/`, without the `.md` extension.

## Commit and branch conventions

Preferred format: **`docs(scope): description (GPD-XXX)`**

- `scope` is the area of the docs affected (e.g. `operator`, `runbooks`, `observability`, `ceph`, `iaas-console`)
- Append the Jira ticket in parentheses at the end; use `(NOJIRA)` when there is no ticket
- Plain descriptions are acceptable for minor edits and dependency updates

Examples:
```
docs(operator): move OPERATOR_REFERENCE under service-operator section (GPD-1040)
docs(runbooks): add WireGuard VPN key rotation runbook (GPD-993)
docs(observability): document alerts and SLIs configuration via inventory (GPD-757)
```

PRs reference the Jira ticket in the title where applicable.

## Key files

| File | Purpose |
|------|---------|
| `docusaurus.config.js` | Site config, versioning settings (`includeCurrentVersion`, navbar) |
| `versions.json` | Ordered list of published doc versions |
| `sidebars.js` | Sidebar structure for current docs |
| `STYLEGUIDE.md` | Writing and formatting conventions |
