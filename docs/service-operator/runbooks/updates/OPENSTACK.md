# Update OpenStack

Upgrading OpenStack version.

**Requires a 1-2h maintenance window.** Notify tenants before starting.

## When to Update

Use this for an OpenStack version bump (for example, 2025.1 → 2026.1).

## Procedure

1. Announce maintenance window to tenants.

2. **Create a snapshot/backup:** Before starting the upgrade, take a snapshot of the controller VM(s) and any relevant databases. Refer to your local backup/snapshot infrastructure guide (e.g., OpenStack snapshot tools).
<!-- TODO: Pending to provide a method to create snapshots/backups  -->

1. Populate the container registry with the new images:

   ```bash
   platform-setup.sh --bootstrap --tags docker-registry
   ```

2. Run full OpenStack deployment:

   ```bash
   platform-setup.sh --upgrade
   ```

3. Verify services:

   ```bash
   platform-setup.sh --check

   platform-setup.sh --shell
   openstack endpoint list
   openstack service list
   ```

## Rollback

If the upgrade fails:

1. Check logs on the controller for the failing service.
2. Re-run with verbose output to identify the failure:

   ```bash
   platform-setup.sh --upgrade -vvv
   ```

**Note:** If the upgrade cannot complete, contact the infrastructure team.
Downgrading OpenStack is complex and may require re-deploying from snapshot.
