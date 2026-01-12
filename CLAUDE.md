# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a **documentation-only repository** for the Phoenix IaaS platform. There is no code to build, test, or lint. The repository contains markdown documentation organized by target persona.

## Structure

- `service-operator/` - Documentation for service operators managing the Phoenix IaaS platform (Ceph setup, deployment, networking, observability, etc.)
- `tenant/` - Documentation for tenants
- `user/` - Documentation for users
- `VERSION` - Contains the current version number (e.g., `1.4.0-main`)

## Versioning

The version is stored in the `VERSION` file and used by GitHub Actions to create versioned documentation artifacts. Artifacts are named with pattern: `{persona}-{version}-{commit_count}-{short_sha}`.

## CI/CD

On push to main, GitHub Actions (`.github/workflows/create-artifacts.yml`) creates separate artifacts for each documentation persona (service-operator, tenant, user).
