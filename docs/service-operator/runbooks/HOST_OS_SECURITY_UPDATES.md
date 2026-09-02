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

## Procedure

The role-specific pre/post sequences are automated by two scripts in the deployment container:
`stop-node.sh` and `start-node.sh`. Both scripts detect the node role from the hostname prefix
(`gpu`, `control`, `storage`) and run the correct sequence automatically.

### Step 1 — Open a tmux session and the deployment container

On `deployment0`, start a named tmux session so the long-running scripts survive a disconnection:

```bash
tmux new-session -s node-maintenance
./scripts/platform-setup.sh --shell
```

### Step 2 — Stop the node (inside the container)

```bash
/scripts/node-maintenance/stop-node.sh <hostname>
```

The script prints the exact SSH commands to run when it completes.

### Step 3 — Apply OS updates and reboot (new terminal on bastion)

```bash
ssh ubuntu@<hostname>
sudo apt update
sudo apt upgrade -y
[ -f /var/run/reboot-required ] && echo "REBOOT REQUIRED" || echo "no reboot needed"
sudo reboot
```

### Step 4 — Restore the node (inside the container, once SSH is back)

```bash
/scripts/node-maintenance/start-node.sh <hostname>
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
