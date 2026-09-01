# Host OS Security Updates (Rolling)

Apply kernel and security patches to individual Phoenix nodes without full cluster downtime.

## When to use

Use this procedure when you apply OS security updates (`apt upgrade`) that require a reboot to one or more physical nodes. The cluster remains operational throughout — you update the nodes one at a time.

For a full-cluster power-down (hardware work, site maintenance), use [OPENSTACK_CLUSTER_STOP_START](./OPENSTACK_CLUSTER_STOP_START.md) instead.

---

## Node types and what differs

Each physical node role requires a different pre/post sequence because of what it runs:

| Role | Nodes | What it runs | Extra steps required |
|---|---|---|---|
| **Compute** | gpu0, gpu1 | nova-compute, neutron agents | Stop tenant VMs. Stop Kolla cleanly. Redeploy after reboot. Restart VMs |
| **Control** | control0, control1, control2 | Galera (MariaDB), RabbitMQ, Nova API, Neutron server… | Stop Kolla on the node cleanly. Redeploy after reboot |
| **Storage** | storage0, storage1, storage2 | Ceph OSD, MON, MGR, RGW | Enter Ceph maintenance mode. Re-add to RGW after |

:::warning
**Never update more than one node of the same role at the same time.** Galera requires a majority (2 of 3) to stay healthy. With `osd_replication: 2`, Ceph has only one copy of some data when a storage node is offline. Finish one node and verify cluster health before you move to the next node.
:::

**Hostnames by location:**

| Location | Control nodes | Compute nodes | Storage nodes |
|---|---|---|---|
| TYO | control{0,1,2}.phoenix.tyo | gpu{0,1}.phoenix.tyo | storage{0,1,2}.phoenix.tyo |
| ISYS | control{0,1,2}.isys | gpu{0,1}.isys | storage{0,1,2}.isys |

---

## Pre-flight checklist

Before you update a node:

- [ ] Ceph cluster is `HEALTH_OK`
- [ ] All three Galera nodes are `Synced` (cluster size = 3)
- [ ] No ongoing `kolla-ansible` operations

**Verify Ceph health** — SSH into any storage node from `deployment0`:

```bash
ssh <any-storage-node>
```

Then run inside the node:

```bash
sudo cephadm shell
ceph health detail
```

**Verify Galera** — SSH into any control node from `deployment0`:

```bash
ssh <any-control-node>
```

Then run inside the node:

```bash
sudo podman exec mariadb mysql -e "SHOW STATUS LIKE 'wsrep_cluster_size'; SHOW STATUS LIKE 'wsrep_local_state_comment'"
```

Expected: `wsrep_cluster_size = 3` and `wsrep_local_state_comment = Synced`.

---

## Procedure: Compute node (gpu0 / gpu1)

### Step 1 — Open a tmux session and the deployment container

All operations in the following steps must run inside a tmux session:

```bash
tmux new-session -s node-maintenance
./scripts/platform-setup.sh --shell
```

### Step 2 — Disable scheduling on the node

```bash
openstack compute service set --disable --reason "OS security update" <hostname>
```

Verify the service shows `disabled`:

```bash
openstack compute service list --host <hostname>
```

### Step 3 — Stop tenant VMs on the node

List all active instances on this node and record their IDs — you will restart them in Step 9:

```bash
openstack server list --host <hostname> --all-projects --status ACTIVE
```

Stop each instance gracefully:

```bash
openstack server stop <instance-id>
```

Wait until no instances are active:

```bash
openstack server list --host <hostname> --all-projects
```

Expected: empty output, or all instances in `SHUTOFF` state.

If the cluster has spare capacity and you prefer zero tenant downtime, use live migration instead:

```bash
openstack server migrate --wait --live-migration <instance-id>
```

### Step 4 — Stop Kolla containers on the target node

```bash
kolla-ansible stop \
  --configdir /infra-management/config \
  -i /infra-management/inventory.ini \
  --vault-password-file /secrets/vault-key.txt \
  --limit <hostname> \
  --yes-i-really-really-mean-it
```

Verify no Kolla containers remain on the target node:

```bash
ssh <hostname> "sudo podman ps --filter 'label=kolla_version' --format '{{.Names}}'"
```

Expected: no output.

### Step 5 — Apply OS updates

```bash
ssh ubuntu@<hostname>
sudo apt update
sudo apt upgrade -y
[ -f /var/run/reboot-required ] && echo "REBOOT REQUIRED" || echo "no reboot needed"
```

### Step 6 — Reboot

```bash
sudo reboot
```

### Step 7 — Redeploy Kolla on the target node

Once SSH is available again, from inside the deployment container:

```bash
kolla-ansible deploy \
  --configdir /infra-management/config \
  -i /infra-management/inventory.ini \
  --vault-password-file /secrets/vault-key.txt \
  --limit <hostname>
```

### Step 8 — Verify containers are healthy

```bash
ssh <hostname> "sudo podman ps --filter 'label=kolla_version' --format '{{.Names}}\t{{.Status}}'"
```

All containers must show `Up … (healthy)`. Key containers on a compute node: `nova_compute`, `neutron_openvswitch_agent`, `openvswitch_vswitchd`.

### Step 9 — Restart stopped tenant VMs

Start each instance that was stopped in Step 3:

```bash
openstack server start <instance-id>
```

Verify the instances reach `ACTIVE` state:

```bash
openstack server list --host <hostname> --all-projects
```

### Step 10 — Re-enable scheduling

```bash
openstack compute service set --enable <hostname>
```

---

## Procedure: Control node (control0 / control1 / control2)

:::warning
Update control nodes one at a time. Verify `wsrep_cluster_size = 3` after each node before you start the next node.
:::

### Step 1 — Verify Galera is fully synced

SSH into the target control node:

```bash
ssh <target-node>
```

Then run inside the node:

```bash
sudo podman exec mariadb mysql -e "SHOW STATUS LIKE 'wsrep_cluster_size'; SHOW STATUS LIKE 'wsrep_local_state_comment'"
```

Expected: `wsrep_cluster_size = 3`, `wsrep_local_state_comment = Synced`.

### Step 2 — Open a tmux session and the deployment container

All operations in the following steps must run inside a tmux session:

```bash
tmux new-session -s node-maintenance
./scripts/platform-setup.sh --shell
```

### Step 3 — Stop Kolla containers on the target node

```bash
kolla-ansible stop \
  --configdir /infra-management/config \
  -i /infra-management/inventory.ini \
  --vault-password-file /secrets/vault-key.txt \
  --limit <hostname> \
  --yes-i-really-really-mean-it
```

Verify no Kolla containers remain on the target node:

```bash
ssh <hostname> "sudo podman ps --filter 'label=kolla_version' --format '{{.Names}}'"
```

Expected: no output.

### Step 4 — Apply OS updates

```bash
ssh ubuntu@<hostname>
sudo apt update
sudo apt upgrade -y
[ -f /var/run/reboot-required ] && echo "REBOOT REQUIRED" || echo "no reboot needed"
```

### Step 5 — Reboot

```bash
sudo reboot
```

### Step 6 — Redeploy Kolla on the target node

Once SSH is available again, from inside the deployment container:

```bash
kolla-ansible deploy \
  --configdir /infra-management/config \
  -i /infra-management/inventory.ini \
  --vault-password-file /secrets/vault-key.txt \
  --limit <hostname>
```

### Step 7 — Verify the node has rejoined the Galera cluster

SSH into the target control node:

```bash
ssh <hostname>
```

Then run inside the node:

```bash
sudo podman exec mariadb mysql -e "SHOW STATUS LIKE 'wsrep_cluster_size'; SHOW STATUS LIKE 'wsrep_local_state_comment'"
```

Expected: `wsrep_cluster_size = 3`, `wsrep_local_state_comment = Synced`.

Verify all containers are healthy:

```bash
ssh <hostname> "sudo podman ps --filter 'label=kolla_version' --format '{{.Names}}\t{{.Status}}'"
```

---

## Procedure: Storage node (storage0 / storage1 / storage2)

This procedure uses the Ceph orchestrator's maintenance mode. All `ceph` commands run inside a `cephadm shell` on any monitor node.

```bash
ssh <any-storage-node>
sudo cephadm shell
```

### Step 1 — Verify Ceph health

```bash
ceph health detail
```

Expected: `HEALTH_OK`. Do not proceed if `HEALTH_WARN` or `HEALTH_ERR`.

### Step 2 — Remove the node from RGW placement

Record the current placement before making any changes:

```bash
ceph orch ls rgw
```

Note the host list and port from the `PLACEMENT` and `PORTS` columns — you will restore this placement in Step 8.

Remove the target node. Set `<count>` to the current total minus one and list only the remaining hosts:

```bash
ceph orch apply rgw gateway \
  --placement="<count> <remaining-host-1> <remaining-host-2>" \
  --port=8080
```

Verify the RGW daemon has stopped on the target node:

```bash
ceph orch ps <hostname> --daemon-type rgw
```

Expected: no output.

### Step 3 — Enter maintenance mode

```bash
ceph orch host maintenance enter <hostname>
```

For a short maintenance window, set `noout` to prevent unnecessary rebalancing:

```bash
ceph osd set noout
```

Wait until all daemons stop on the node:

```bash
watch 'ceph orch ps <hostname>'
```

Expected: empty output. Press `Ctrl+C` to exit.

### Step 4 — Apply OS updates

```bash
ssh ubuntu@<hostname>
sudo apt update
sudo apt upgrade -y
[ -f /var/run/reboot-required ] && echo "REBOOT REQUIRED" || echo "no reboot needed"
```

### Step 5 — Reboot

```bash
sudo reboot
```

### Step 6 — Exit maintenance mode

Once the node is back online and reachable via SSH:

```bash
# Inside cephadm shell
ceph orch host maintenance exit <hostname>
```

If `noout` was set in Step 3, unset it now:

```bash
ceph osd unset noout
```

### Step 7 — Verify OSDs and cluster health

```bash
ceph orch ps <hostname>
ceph health detail
```

Expected: all daemons running, `HEALTH_OK`. Allow 2–3 minutes for OSDs to fully rejoin.

### Step 8 — Re-add the node to RGW

Restore the full placement including the returned node (using the values recorded in Step 2):

```bash
# TYO example
ceph orch apply rgw gateway \
  --placement="3 storage0.phoenix.tyo storage1.phoenix.tyo storage2.phoenix.tyo" \
  --port=8080

# ISYS example
ceph orch apply rgw gateway \
  --placement="3 storage0.isys storage1.isys storage2.isys" \
  --port=8080
```

Verify an RGW daemon is running on each host:

```bash
ceph orch ps --daemon-type rgw
```

---

## Troubleshooting

### Galera does not reform after control node reboot

Run the automated recovery from the deployment container:

```bash
kolla-ansible mariadb_recovery \
  --configdir /infra-management/config \
  -i /infra-management/inventory.ini \
  --vault-password-file /secrets/vault-key.txt
```

If recovery cannot identify the bootstrap candidate automatically, inspect each control node manually. Find the node with `safe_to_bootstrap: 1` or the highest `seqno`. See [OPENSTACK_CLUSTER_STOP_START — Galera troubleshooting](./OPENSTACK_CLUSTER_STOP_START.md#galera-cluster-does-not-form-after-restart) for the full procedure.

### Kolla containers do not restart after reboot

If OVS is down, nova-compute and neutron agents will not start. Fix OVS first:

```bash
ssh <hostname> "sudo podman start openvswitch_vswitchd"
```

Then re-run `kolla-ansible deploy --limit <hostname>`.

### Ceph OSDs do not rejoin after storage node reboot

Allow 2–3 minutes, then run:

```bash
ceph osd tree
```

Restart individual OSDs that remain `down`:

```bash
ceph orch daemon restart osd.<id>
```

See [CEPH_NODE_MAINTENANCE — Troubleshooting](./CEPH_NODE_MAINTENANCE.md#troubleshooting) for further steps.
