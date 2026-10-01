# Recovering a management VM with disk corruption

Recover a management cluster VM that is unreachable after a hard crash

---

## Prerequisites Checklist

- [ ] SSH access to bastion with the `mido_infra` key
- [ ] SSH access to a storage node (`storage0`–`storage2`) via bastion
- [ ] OpenStack CLI on bastion via `platform-setup.sh --shell`
- [ ] `kubectl` access to the management cluster

---

## Step 1: Identify the affected VM and confirm it was hard-killed

The alert fires on the availability ratio — it does not tell you which VM is down. Run this query in **Grafana → Explore (Prometheus)**:

```promql
libvirt_domain_info_state != 1
```

Results include a `domain` label (e.g. `instance-0000000f`) and an `instance` label (the hypervisor, e.g. `control1`). Note both.

From bastion shell, map the domain name to the OpenStack server ID:

```bash
openstack server list --all-projects --host <hypervisor> -f value -c ID | \
  xargs -I{} openstack server show {} -c ID -c Name -c "OS-EXT-SRV-ATTR:instance_name"
```

Identify the row matching the domain name, then confirm the stop was not user-initiated:

```bash
SERVER_ID=<id-from-above>
STOP_REQ=$(openstack server event list $SERVER_ID -f value -c "Request ID" -c "Action" | awk '/stop/{print $1; exit}')
openstack server event show $SERVER_ID $STOP_REQ -c action -c user_id -c message
```

**Expected:** `user_id` is `None` — the stop was triggered internally (OOM kill, hypervisor fault). The disk may be corrupted.

**Do not start the VM yet.** Proceed to Step 2 to repair the disk first.

**If `user_id` is set:** this runbook does not apply — the VM was intentionally stopped.

---

## Step 2: Repair all disks

List all Cinder volumes attached to the VM:

```bash
openstack server show $SERVER_ID -c volumes_attached
```

Note any volume IDs — repair each one after the root disk.

SSH to any storage node from bastion:

```bash
ssh -i ~/.ssh/mido_infra.pem ubuntu@storage0
```

**Always repair the root disk:**

```bash
SERVER_ID=<value-from-step-1>
RBD_IMAGE="vms/${SERVER_ID}_disk"
sudo rbd status $RBD_IMAGE
```

**Expected:** `Watchers: none`. If watchers are listed, the VM is still running — see [Troubleshooting](#rbd-status-shows-watchers).

```bash
DEVICE=$(sudo rbd device map $RBD_IMAGE)
sudo lsblk -o NAME,SIZE,FSTYPE $DEVICE
```

Pick the largest partition with an `ext4` filesystem (e.g. `${DEVICE}p1` or `${DEVICE}p2`):

```bash
sudo e2fsck -fy <partition>
sudo rbd device unmap $DEVICE
```

**Repair each attached Cinder volume** (repeat for every volume ID from above):

```bash
CINDER_VOLUME_ID=<volume-id>
RBD_IMAGE="volumes/volume-${CINDER_VOLUME_ID}"
sudo rbd status $RBD_IMAGE
DEVICE=$(sudo rbd device map $RBD_IMAGE)
sudo lsblk -o NAME,SIZE,FSTYPE $DEVICE
```

If the volume is raw (no partitions listed), run `e2fsck` on the device directly. If partitioned, pick the largest `ext4` partition:

```bash
sudo e2fsck -fy <device-or-partition>
sudo rbd device unmap $DEVICE
```

---

## Step 3: Restart the VM

```bash
openstack server start $SERVER_ID
openstack console log show $SERVER_ID | tail -20
```

**Expected:** normal Ubuntu boot sequence ending with a login prompt.

---

## Step 4: Verify cluster health

```bash
export KUBECONFIG=/infra-management/kubeconfig  # or your local kubeconfig
kubectl get nodes
kubectl get pods -A --field-selector=spec.nodeName=<vm-name>
```

**Expected:** node is `Ready`, all pods are `Running` or `Completed`.

---

## ✓ Done

---

## Troubleshooting

### `rbd status` shows watchers

The VM is still running. Stop it and wait:

```bash
openstack server stop $SERVER_ID
watch -n5 "openstack server show $SERVER_ID -c OS-EXT-STS:power_state -f value"
```

`power_state = 4` means shutdown. Then retry `rbd status`.

### A Cinder volume is still corrupted after repair

List all volumes attached to the VM to check none were missed:

```bash
openstack server show $SERVER_ID -c volumes_attached
```

Stop the VM, repeat the Cinder volume repair in Step 2 for the missing volume, then restart.
