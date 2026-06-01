# Recovering a locked RBD volume

Unlock a Ceph RBD volume stuck after a VM hard crash

When a VM crashes hard (for example, due to a hypervisor failure), it may leave a stale exclusive lock on its underlying Ceph RBD volume. OpenStack reports the volume as `available` but it cannot be deleted or successfully attached and mounted. This runbook describes how to identify the stale lock, remove it, and either recover the VM or clean up the zombie volume.

---

## Prerequisites Checklist

- [ ] SSH access to a Ceph monitor node (`ceph_mon_hosts` in inventory)
- [ ] OpenStack CLI configured and authenticated (sourced RC file or equivalent)
- [ ] The OpenStack volume ID of the affected volume

All `rbd` commands in this runbook must be run inside a `cephadm shell`. Connect to any monitor node and enter the shell before starting:

```bash
ssh <ceph-node>
sudo cephadm shell
```

---

## Step 1: Identify the affected volume

List volumes that appear stuck (status `available` but cannot be deleted, or `in-use` with no live VM):

```bash
openstack volume list --all --long
```

Note the **Volume ID** (UUID) of the affected volume. Confirm it cannot be deleted:

```bash
openstack volume delete <volume-id>
```

If the delete fails or hangs, proceed with the steps below.

---

## Step 2: Check whether a VM holds the volume

Check whether the volume is still attached to a VM in OpenStack:

```bash
openstack volume show <volume-id>
```

Look at the `attachments` field. If a server is listed, check its status:

```bash
openstack server show <server-id>
```

Expected state for a crashed VM: `ERROR` or `SHUTOFF`.

:::note

If the volume shows no attachments in OpenStack but still cannot be deleted, the lock may exist only at the Ceph level. Skip to Step 4.

:::

---

## Step 3: Confirm the VM is not actively running

Before touching the Ceph lock, confirm the hypervisor is not actively using the volume. A running VM with an active lock must not have its lock removed while in use.

If the VM is in `ERROR` state, it is safe to proceed. If the VM is `ACTIVE`, shut it down first:

```bash
openstack server stop <server-id>
```

Wait for the VM to reach `SHUTOFF` before continuing:

```bash
openstack server show <server-id> | grep status
```

---

## Step 4: Locate the RBD image

OpenStack Cinder volumes map to RBD images named `volume-<openstack-volume-uuid>` in the `volumes` pool. Confirm the image exists:

```bash
rbd ls volumes | grep <volume-id>
```

Expected output: `volume-<volume-id>`

Check for active watchers and locks:

```bash
rbd status volumes/volume-<volume-id>
```

If there are no watchers and no locks reported, the issue is at the OpenStack layer rather than Ceph. Skip to the [Volume cannot be deleted after lock removal](#volume-cannot-be-deleted-after-lock-removal) troubleshooting section.

---

## Step 5: Remove the stale RBD lock

List the locks on the image:

```bash
rbd lock list volumes/volume-<volume-id>
```

Example output with a stale lock:

```
Locker           ID                                    Address
client.12345678  kubelet_lock_magic_<server-id>        10.0.0.5:0/987654
```

Remove the lock using the locker and ID from the output:

```bash
rbd lock remove volumes/volume-<volume-id> <id> <locker>
```

For example:

```bash
rbd lock remove volumes/volume-abc123 "kubelet_lock_magic_4be055fc" "client.12345678"
```

Confirm the lock is gone:

```bash
rbd lock list volumes/volume-<volume-id>
```

Expected output: empty.

:::warning

This procedure needs to be tested and validated in your environment before use in production. Verify the exact lock ID format from `rbd lock list` output before running `rbd lock remove`.

:::

---

## Step 6: Recover or clean up

Choose the appropriate outcome.

### Option A: Recover the VM

If the goal is to bring the VM back into service, restart it via OpenStack:

```bash
openstack server start <server-id>
```

Monitor the VM until it reaches `ACTIVE`:

```bash
openstack server show <server-id> | grep status
```

Verify the volume is accessible inside the VM before considering the incident resolved.

### Option B: Delete the VM and volume

If the VM is no longer needed or recovery is not possible:

1. Delete the VM:

   ```bash
   openstack server delete <server-id>
   ```

2. Confirm the volume is now in `available` state:

   ```bash
   openstack volume show <volume-id> | grep status
   ```

3. Delete the volume:

   ```bash
   openstack volume delete <volume-id>
   ```

---

## Troubleshooting

### Volume cannot be deleted after lock removal

The volume may be stuck in a transient OpenStack state. Force a status reset:

```bash
openstack volume set --state available <volume-id>
```

Then retry:

```bash
openstack volume delete <volume-id>
```

### Lock removal fails with "image busy" or "permission denied"

Another client may still have an active watcher on the image. Check:

```bash
rbd status volumes/volume-<volume-id>
```

If a watcher is present from a compute node, SSH to that node and identify the process holding the image open:

```bash
grep -rl <volume-id> /proc/*/fd 2>/dev/null
```

If the process is a stale `qemu` or `libvirt` instance with no live VM, kill it, then retry the lock removal.

### VM fails to restart after lock removal

Check the VM console log for errors:

```bash
openstack console log show <server-id>
```

If the disk was corrupted by the crash, the VM may need to be rebuilt rather than restarted. In that case, follow Option B to delete it and the volume, then reprovision.

### Volume appears `in-use` in OpenStack after the VM is deleted

Force the volume status back to `available`:

```bash
openstack volume set --state available <volume-id>
```

Then retry the delete.
