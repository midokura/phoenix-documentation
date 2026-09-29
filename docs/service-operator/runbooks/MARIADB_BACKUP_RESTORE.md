# MariaDB backup and restore

Back up the OpenStack MariaDB/Galera database cluster and restore it from a backup.

## When to use this

| Scenario | Runbook |
|---|---|
| All Galera nodes are up but the cluster has lost quorum | [OpenStack cluster safe stop / cold start — Galera troubleshooting](./OPENSTACK_CLUSTER_STOP_START.md#galera-cluster-does-not-form-after-restart) |
| Data is corrupted, accidentally deleted, or you need a point-in-time restore | **This runbook** |

This runbook covers full and incremental backups with Kolla Ansible, and restore from those backups. It does **not** cover Galera quorum recovery. Quorum recovery uses `kolla-ansible mariadb_recovery` and is in the cluster stop/start runbook.

---

## Prerequisites checklist

- [ ] SSH access to `deployment0` (the Ansible bastion)
- [ ] The Ansible Vault password for the environment
- [ ] All control nodes are reachable
- [ ] For restore: a valid backup exists on the controller node (see [Step 2](#step-2-take-a-full-backup))

All Kolla Ansible commands in this runbook run inside the deployment container. Before you start, open a tmux session and the container shell:

```bash
tmux new-session -s mariadb-backup
./scripts/platform-setup.sh --shell
```

---

## Part 1: Backup

### Step 1: Make sure that the cluster is healthy

Make sure that Galera is in a healthy state before you take a backup:

```bash
kolla-ansible mariadb_recovery \
  --configdir /infra-management/config \
  -i /infra-management/inventory.ini \
  --vault-password-file /secrets/vault-key.txt \
  --check
```

You can also check from within a MariaDB container on a controller node:

```bash
ssh <controller-node> "sudo podman exec mariadb mysql -u root -p\$(sudo cat /etc/kolla/passwords.yml | grep database_password | awk '{print \$2}') -e 'SHOW STATUS LIKE \"wsrep_cluster_status\";'"
```

**Expected:** `wsrep_cluster_status = Primary`. If the cluster is not in `Primary` state, do not proceed.

---

### Step 2: Take a full backup

Run the backup playbook. By default it takes a **full backup**:

```bash
kolla-ansible mariadb_backup \
  --configdir /infra-management/config \
  -i /infra-management/inventory.ini \
  --vault-password-file /secrets/vault-key.txt
```

This command streams a `mariabackup` snapshot into the backup directory on the primary controller node. The command takes several minutes. Do not interrupt it.

Make sure that the backup was written:

```bash
ssh <controller-node> "sudo ls -lht /var/lib/docker/volumes/mariadb_backup/_data/ | head -10"
```

Each backup is a directory with a timestamp (for example, `2026-09-29-12-00-00`). Make sure that a new directory exists and has a non-zero size.

---

### Step 3: Take an incremental backup (optional)

After a full backup exists, you can take incremental backups. Incremental backups capture changes after the last backup:

```bash
kolla-ansible mariadb_backup \
  --configdir /infra-management/config \
  -i /infra-management/inventory.ini \
  --vault-password-file /secrets/vault-key.txt \
  -e mariadb_backup_type=incremental
```

Incremental backups are faster and smaller than full backups. To restore an incremental backup, you need the full backup and all incremental backups up to the target point in time. Do not delete the full backup while any incremental backups depend on it.

---

### Step 4: Copy backups off the controller (recommended)

A backup stored only on the controller node is at risk if that node is lost. Copy the backup to a safe location after each backup:

```bash
# From deployment0 or an external host with access to the controller
BACKUP_DIR="/var/lib/docker/volumes/mariadb_backup/_data"
DEST="<backup-storage-host>:<destination-path>"

rsync -avz --progress <controller-node>:${BACKUP_DIR}/ ${DEST}/
```

---

## Part 2: Restore

:::danger

Restoring MariaDB overwrites the current database state on all control nodes. This action is irreversible. Make sure that you restore the correct backup before you proceed.

:::

### Step 1: Stop all OpenStack services

The database must not accept writes during a restore. Follow the full stop sequence from the [OpenStack cluster safe stop / cold start](./OPENSTACK_CLUSTER_STOP_START.md#stop-sequence) runbook, up to and including `kolla-ansible stop`.

---

### Step 2: Identify the backup to restore

List the available backups on the primary controller:

```bash
ssh <controller-node> "sudo ls -lht /var/lib/docker/volumes/mariadb_backup/_data/"
```

Note the timestamp directory of the backup you want to restore (for example, `2026-09-29-12-00-00`).

If you restore from an incremental backup, you need the full backup directory and all incremental directories up to the target point in time.

---

### Step 3: Run the restore

```bash
kolla-ansible mariadb_restore \
  --configdir /infra-management/config \
  -i /infra-management/inventory.ini \
  --vault-password-file /secrets/vault-key.txt
```

Kolla Ansible will prompt you to confirm the backup timestamp. The playbook does these steps:

1. Stops any remaining MariaDB containers.
2. Prepares the backup and applies incremental changes if present.
3. Copies the restored data directory to all control nodes.
4. Restarts MariaDB and reforms the Galera cluster.

This takes several minutes. Do not interrupt it.

---

### Step 4: Make sure that the restored cluster is healthy

Make sure that Galera has reformed and the cluster size matches the number of control nodes:

```bash
ssh <controller-node> "sudo podman exec mariadb mysql -u root -p\$(sudo cat /etc/kolla/passwords.yml | grep database_password | awk '{print \$2}') \
  -e 'SHOW STATUS LIKE \"wsrep_cluster_size\"; SHOW STATUS LIKE \"wsrep_cluster_status\"; SHOW STATUS LIKE \"wsrep_local_state_comment\";'"
```

**Expected:**
- `wsrep_cluster_size` = number of controller nodes (for example, `3`)
- `wsrep_cluster_status` = `Primary`
- `wsrep_local_state_comment` = `Synced`

---

### Step 5: Restart OpenStack services

Follow the [cold start sequence](./OPENSTACK_CLUSTER_STOP_START.md#start-sequence-cold-start) from the cluster stop/start runbook to bring all OpenStack services back up.

---

## Troubleshooting

### Backup fails mid-run

Examine the `mariabackup` container logs on the primary controller:

```bash
ssh <controller-node> "sudo podman logs mariadb_backup --tail 100"
```

A common cause is insufficient disk space in the backup volume. Examine the available space:

```bash
ssh <controller-node> "sudo df -h /var/lib/docker/volumes/mariadb_backup/"
```

If the disk is full, remove old backup directories before you try again. Make sure that you identify which directories are safe to remove:

```bash
ssh <controller-node> "sudo ls /var/lib/docker/volumes/mariadb_backup/_data/"
ssh <controller-node> "sudo rm -rf /var/lib/docker/volumes/mariadb_backup/_data/<old-timestamp>"
```

### Restore fails — Galera does not reform

If the Galera cluster does not reach `Primary` state after a restore, run the automated recovery:

```bash
kolla-ansible mariadb_recovery \
  --configdir /infra-management/config \
  -i /infra-management/inventory.ini \
  --vault-password-file /secrets/vault-key.txt
```

If automated recovery cannot identify a bootstrap candidate, see the [Galera troubleshooting section](./OPENSTACK_CLUSTER_STOP_START.md#galera-cluster-does-not-form-after-restart) in the cluster stop/start runbook for manual bootstrap steps.

### Restore fails — backup directory not found

Kolla Ansible expects the backup to be in the backup volume on the primary controller. If you moved the backup to external storage, copy it back to the controller first:

```bash
BACKUP_TIMESTAMP="<timestamp>"
BACKUP_SRC="<backup-storage-host>:<source-path>/${BACKUP_TIMESTAMP}"
DEST_DIR="/var/lib/docker/volumes/mariadb_backup/_data/"

rsync -avz --progress ${BACKUP_SRC} <controller-node>:${DEST_DIR}
```

Then run the restore step again.
