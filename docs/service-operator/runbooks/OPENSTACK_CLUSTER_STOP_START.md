# OpenStack cluster safe stop / cold start

Shut down the Phoenix OpenStack cluster cleanly and bring it back up without data loss.

## When to use this

Use this procedure any time the OpenStack cluster needs to be powered off: scheduled host maintenance, OS updates, hardware work, or a planned site power event.

Skipping the stop sequence risks:

- **Galera split-brain** — MariaDB/Galera requires all nodes to have a clean shutdown for automatic quorum recovery on the next start. A dirty stop leaves nodes with inconsistent sequence numbers and the cluster will refuse to start without manual intervention.
- **Ceph OSD inconsistency** — OSDs that exit without deactivating gracefully may mark placement groups as inconsistent, requiring a scrub before the cluster returns to `HEALTH_OK`.
- **RabbitMQ queue loss** — Unflushed queues can leave Nova and Neutron task state in an unknown condition after restart.

---

## Prerequisites Checklist

- [ ] SSH access to `deployment0` (the Ansible bastion)
- [ ] The Ansible Vault password for the environment
- [ ] All OpenStack hosts are reachable and the cluster is in a healthy state before stopping

---

## Stop sequence

### Open a tmux session and the deployment container

All operations in this runbook must run inside a tmux session. This protects long-running commands (especially `kolla-ansible stop` and `deploy`) from SSH disconnections — an interrupted stop or deploy can leave Galera or Ceph in an inconsistent state that requires manual recovery.

From `deployment0`, start a named session:

```bash
tmux new-session -s cluster-maintenance
```

If you reconnect after a disconnection, reattach with:

```bash
tmux attach-session -t cluster-maintenance
```

Inside the tmux session, open a shell in the deployment container:

```bash
./scripts/platform-setup.sh --shell
```

All subsequent steps in the stop sequence run inside this container shell unless noted otherwise.

### Step 1: Verify cluster health

Before stopping anything, confirm there are no ongoing Galera or Ceph recovery operations:

```bash
ssh <storage-node> "sudo cephadm shell -- ceph health detail"
```

**Expected:** `HEALTH_OK`

Do not proceed if Ceph reports `HEALTH_WARN` or `HEALTH_ERR` — stopping OSDs during recovery can cause data loss.

### Step 2: Save and stop running Nova instances

Capture the UUIDs of all active instances and shut them down through the OpenStack API. This allows the guest operating systems to flush their filesystems before the Nova containers stop.
Take into consideration that this step will make phoenix system unavailable, both customer and system VM's will be stopped. 

```bash
# Save running instance UUIDs
openstack server list --status ACTIVE --format value --column ID \
  > /infra-management/.nova-running-vms

echo "Instances to stop: $(wc -l < /infra-management/.nova-running-vms)"

# Request graceful stop for each
while IFS= read -r vm_id; do
  [ -z "$vm_id" ] && continue
  openstack server stop "$vm_id" && echo "  stopping: $vm_id"
done < /infra-management/.nova-running-vms
```

Wait for all instances to reach `SHUTOFF` before proceeding. Poll until the active count reaches zero:

```bash
until [ "$(openstack server list --status ACTIVE --format value --column ID | wc -l)" -eq 0 ]; do
  echo "  $(openstack server list --status ACTIVE --format value --column ID | wc -l) instance(s) still active — waiting..."
  sleep 5
done
echo "All instances stopped."
```

Allow up to 60 seconds.

:::warning
If any instance has not stopped after 60 seconds, `kolla-ansible stop` in the next step will hard-kill the Nova containers. Those instances may have filesystem inconsistencies on the next boot.
:::

### Step 3: Stop all OpenStack services

Run `kolla-ansible stop`. Kolla stops all service containers in dependency order — compute services first, Galera and Ceph last.

```bash
kolla-ansible stop \
  --configdir /infra-management/config \
  -i /infra-management/inventory.ini \
  --vault-password-file /secrets/vault-key.txt \
  --yes-i-really-really-mean-it
```

This command takes several minutes. Do not interrupt it.

**Verify no Kolla containers remain on the control node:**

```bash
ssh <controller-node> "sudo podman ps --filter 'label=kolla_version' --format '{{.Names}}'"
```

Expected output: none. All Kolla-managed containers have stopped.

:::warning
Do not power off any hosts until this step completes. An interrupted stop leaves Galera in a partial state that requires manual bootstrap to recover.
:::

### Step 4: Exit the container and power off the hosts

Exit the container shell:

```bash
exit
```

Shut down the cluster nodes in this order to minimise dependency issues:

1. Compute nodes
2. Network nodes
3. Storage nodes (Ceph)
4. Control nodes

The specific shutdown mechanism depends on your infrastructure. Using IPMI from bastion:

```bash
ipmitool -H <host-bmc-ip> -U <user> -P <password> chassis power off
```

Shut down bastion last, after all other nodes are confirmed off.

---

## Start sequence (cold start)

### Step 1: Power on the hosts

Bring up the nodes in reverse order:

1. Control nodes
2. Storage nodes (Ceph)
3. Network nodes
4. Compute nodes

Wait for SSH to be available on each group before proceeding to the next.

### Step 2: Open a tmux session and the deployment container

As in the stop sequence, all operations must run inside a tmux session. Reattach to the existing session if it is still open, or create a new one:

```bash
tmux attach-session -t cluster-maintenance || tmux new-session -s cluster-maintenance
```

Inside the tmux session, open the deployment container shell:

```bash
./scripts/platform-setup.sh --shell
```

From inside the container, confirm Kolla Ansible can reach every host:

```bash
kolla-ansible prechecks \
  --configdir /infra-management/config \
  -i /infra-management/inventory.ini \
  --vault-password-file /secrets/vault-key.txt
```

Resolve any failures before proceeding to the deploy step.

### Step 3: Restart OpenStack services

`kolla-ansible deploy` is the correct inverse of `kolla-ansible stop`. It recreates stopped containers from images already present on disk — no image re-pull or re-bootstrap is needed. It is idempotent and safe to re-run if interrupted.

```bash
kolla-ansible deploy \
  --configdir /infra-management/config \
  -i /infra-management/inventory.ini \
  --vault-password-file /secrets/vault-key.txt
```

**Verify services are healthy on the control node:**

```bash
ssh <controller-node> "sudo podman ps --filter 'label=kolla_version' --format '{{.Names}}\t{{.Status}}'"
```

All containers should show `Up … (healthy)`.

### Step 4: Restart Nova instances

Read the UUID list saved in Step 2 of the stop sequence and start each instance:

```bash
if [[ -s /infra-management/.nova-running-vms ]]; then
  while IFS= read -r vm_id; do
    [ -z "$vm_id" ] && continue
    openstack server start "$vm_id" && echo "  starting: $vm_id"
  done < /infra-management/.nova-running-vms
  rm -f /infra-management/.nova-running-vms
  echo "Start requests sent. Instances boot asynchronously."
else
  echo "No saved instance list — nothing to start."
fi
```

Monitor instance boot progress:

```bash
openstack server list
```

---

## Troubleshooting

### Galera cluster does not form after restart

If MariaDB containers start but the cluster fails to reach quorum, run the automated recovery command — it identifies the most advanced node and bootstraps the cluster automatically:

```bash
kolla-ansible mariadb_recovery \
  --configdir /infra-management/config \
  -i /infra-management/inventory.ini \
  --vault-password-file /secrets/vault-key.txt
```

If `mariadb_recovery` cannot determine the bootstrap candidate automatically, inspect each control node manually:

```bash
ssh <controller-node> "sudo podman exec mariadb cat /var/lib/mysql/grastate.dat"
```

Repeat on all control nodes. The node with `safe_to_bootstrap: 1` or the highest `seqno` value is the bootstrap candidate. Once identified, set it manually on that node:

```bash
ssh <bootstrap-node> "sudo podman exec mariadb \
  sed -i 's/safe_to_bootstrap: 0/safe_to_bootstrap: 1/' /var/lib/mysql/grastate.dat"
```

Then re-run `kolla-ansible deploy`. The remaining Galera nodes will sync from the bootstrap node automatically.

### kolla-ansible deploy fails — containers will not start

Check logs on the affected host:

```bash
ssh <host> "sudo podman logs <container-name> --tail 100"
```

If the failure is networking-related (containers cannot reach the API VIP or each other), verify OVS is running:

```bash
ssh <host> "sudo podman ps --filter name=openvswitch_vswitchd --format '{{.Status}}'"
```

If the OVS container is down, start it first, then re-run the deploy:

```bash
ssh <host> "sudo podman start openvswitch_vswitchd"
```

### Nova instance stuck in ERROR after start

Reset the instance state and retry:

```bash
openstack server set --state active <vm-id>
openstack server start <vm-id>
```

If the instance remains in `ERROR`, inspect the nova-compute log on the host where it was last scheduled:

```bash
ssh <compute-node> "sudo podman logs nova_compute --tail 100"
```

### Ceph stuck in HEALTH_WARN after restart

Allow 2–3 minutes after the storage nodes come up for the OSDs to rejoin. Monitor recovery:

```bash
ssh <storage-node> "sudo cephadm shell -- ceph -w"
```

If specific OSDs remain `down` after 5 minutes, restart them individually:

```bash
ssh <storage-node> "sudo cephadm shell -- ceph orch daemon restart osd.<id>"
```

### Management cluster unavailable after cold start

If the K3s management cluster or its services are unreachable after a cold start, confirm DNS is working from a management node:

```bash
ssh <management-node> nslookup kubernetes.default.svc.cluster.local
```

If DNS resolution fails, check whether the CoreDNS pods are running:

```bash
kubectl get pods -n kube-system -l k8s-app=kube-dns
```

If pods are in `ImagePullBackOff`, the management network gateway may not be reachable. Verify that the gateway address configured for the management network is up before restarting the pods:

```bash
kubectl delete pod -n kube-system -l k8s-app=kube-dns
```
