# Software Updates — Overview

Overview of all AI Factory software update procedures.

This document is the entry point for all AI Factory software update procedures. It describes what components exist, how updates are discovered, and which updates require downtime.

## Component Inventory

| Component | Update Frequency |
|---|---|
| **AI Factory PaaS (iaas-console / observability)** | Each minor AI Factory release |
| **Management cluster** | As needed; typically follows K3s releases |
| **OpenStack** | Each major AI Factory release |
| **Inventory / Configuration** | As needed for config changes |
| **Guest images** | Each AI Factory release |
| **Node OS (Control and Compute Nodes)** | Point releases, kernel security patches |

## Discovery of Updates

Operators learn about new updates through:

1. **Release Notifications:** Announcements sent to the `ai-factory-announce` mailing list.
2. **Release Notes:** Published in the [AI Factory Documentation](https://docs.midokura.com/).

## Distribution of Updates

Updates are distributed through the following channels:

- **Release Bundles (Automation & Scripts):**
  - Distributed as downloadable archives (for example, `.tar.gz`) linked in the Release Notes and Announcement emails.
  - Operators download and extract the bundle to the bastion host.
- **Container Images:**
  - Hosted on the project's Container Registry.
  - `platform-setup.sh` pulls these images during the deployment phase.
- **Guest Images:**
  - Hosted on the project's S3-like storage.
  - `platform-setup.sh` downloads these images during the deployment phase.
- **Node OS Images (Control and Compute Nodes):**
  - Hosted on the project's S3-like storage.
  - The PXE server downloads these images during the `platform-setup.sh --bootstrap` execution.

## Downtime Matrix

| Update Type | Downtime? | Notes |
|---|---|---|
| AI Factory PaaS (iaas-console / observability) | **No downtime** | Rolling K8s deployment; brief pod restart only |
| Management cluster update | **Management plane only** | OpenStack API and workloads unaffected; iaas-console & observability platform briefly unavailable |
| OpenStack version upgrade | **Maintenance window required** | Service restarts, haproxy brief outage; notify tenants |
| Configuration-only changes (inventory) | **Depends on what changed** | See [UPDATE_CONFIGURATION.md](UPDATE_CONFIGURATION.md) for per-variable impact |
| Guest images update | **No downtime** | New images available immediately; existing instances unaffected |
| Node OS re-provisioning | **Full node downtime** | Loss of compute capacity on target node; evacuate Nova instances first |
