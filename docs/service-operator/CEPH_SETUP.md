---
sidebar_position: 20
---

# Setup Ceph

Provisioning Ceph storage clusters via script on dedicated nodes

You can provision a Ceph storage cluster on dedicated nodes using the automated provisioning script. The script runs an Ansible playbook that handles the full lifecycle: installation, bootstrapping, node expansion, OSD provisioning, pool creation, and keyring generation.

## Prerequisites

### Prepare the inventory

Before running `--provision-ceph`, the bootstrap phase (`platform-setup.sh --bootstrap`) must have completed.

The network fabric and storage network must be up. The nodes with `role: storage` in `servers.list` must have been PXE-booted and have Ubuntu installed — these are the nodes that will form the Ceph cluster.

---

**`ceph_mon_hosts`** · *required*

Hostnames of the storage nodes, taken from `servers.list` entries with `role: storage`. The monitor count must be *odd and ≥ 3* for quorum; in an AI Factory deployment the same nodes serve as both Ceph monitors and OSDs.

```yaml
ceph_mon_hosts: [storage0, storage1, storage2]
```

---

**`ceph_mon_ips`** · *required*

Storage network IP of each node, in the *same order* as `ceph_mon_hosts`. Taken from the `storage_ip` field in `servers.list`.

```yaml
ceph_mon_ips: [10.33.0.20, 10.33.0.21, 10.33.0.22]
```

---

**`ceph.public_network`** · *required*

CIDR of the storage network — the same subnet as the `storage_ip` addresses above.

```yaml
ceph.public_network: 10.33.0.0/24
```

---

**`ceph_fsid`** · *required*

Stable UUID that identifies the cluster. Generate once with `uuidgen` and *commit it to inventory*.

When running against an existing cluster, this must match its current FSID — a mismatch causes OSD device label lookups to fail and the playbook will not manage the cluster.

```bash
uuidgen
```

---

**`ceph.osd_replication`** · *required* · default: `2`

Number of data copies per object. `2` is standard; use `3` only for extra durability, which requires ≥ 3 OSDs.

---

**`ceph.pg_count`** · default: *auto*

Per-pool placement group count. Omit to auto-calculate:

```
(OSD count × 100) / osd_replication / pool_count
```

rounded up to the next power of 2. For example, 6 OSDs with replication `2` across 4 pools → 64 PGs per pool.

---

**`provision_zap_disks`** · default: `false`

Controls whether the playbook erases disks before claiming them as OSDs.

:::warning

- **Fresh disks / first-time provisioning**: set `provision_zap_disks: true`. Without it, the playbook will skip disk erasure and *no OSDs will be created* on uninitialized disks.
- **Reprovisioning nodes with existing OSDs**: leave as `false` to keep existing OSD data intact.

Only set `provision_zap_disks: true` when you are certain the target disks can be wiped.

:::

---

**`ceph_osd_devices`** · *optional*

By default the playbook derives the OSD device map from the `data_disks` field under each storage node in `servers.list`:

```yaml
servers:
  list:
    storage0:
      role: storage
      storage:
        data_disks:
          - path: /dev/sdc
          - path: /dev/sdd
```

Set `ceph_osd_devices` explicitly only if you need to use a different set of disks than what is defined in `servers.list`:

```yaml
ceph_osd_devices:
  storage0: [/dev/sdc, /dev/sdd]
  storage1: [/dev/sdc, /dev/sdd]
  storage2: [/dev/sdc, /dev/sdd]
```

### Storage node OS

All storage nodes listed in `ceph_mon_hosts` must have Ubuntu installed, be reachable via SSH from the bastion, and the connecting user must have passwordless `sudo`.

### Verify disk allocation before provisioning

Before running `--provision-ceph`, confirm that the OS RAID pair and data disks on each storage node match what is declared in `inventory.yml`. A mismatch — for example, the PXE installer landing the OS on a disk intended for Ceph — will cause the playbook to fail after zapping disks, with an error like:

```
Configured device storage2:/dev/nvme4n1 is not visible in 'ceph orch device ls'
```

On each storage node, run:

```bash
lsblk | grep -E "md0|nvme|sd"
```

Check that:
- The RAID1 OS array (`md0`) is built from the two disks listed under `storage.disks` in `inventory.yml`
- All disks listed under `storage.data_disks` in `inventory.yml` appear **without** partitions

Example of a correct layout (inventory: `disks: [nvme0n1, nvme1n1]`, `data_disks: [nvme2n1..nvme7n1]`):

```
nvme0n1     ...  disk
├─nvme0n1p1 ...  part  /boot/efi
└─nvme0n1p2 ...  part
  └─md0     ...  raid1 /
nvme1n1     ...  disk
├─nvme1n1p1 ...  part  /boot/efi2
└─nvme1n1p2 ...  part
  └─md0     ...  raid1 /
nvme2n1     ...  disk            ← no partitions, available for Ceph
nvme3n1     ...  disk
...
```

If the OS landed on the wrong disk (e.g. `md0` uses `nvme4n1` instead of `nvme1n1`), re-provision the node via PXE before continuing — do not update the inventory to match the wrong layout, as this would permanently sacrifice a data disk.

## Installation

### Run the provisioning playbook

```bash
./scripts/platform-setup.sh --provision-ceph
```

You will be prompted for the vault password at the start of the run.

### What it does

The playbook performs the following steps automatically:

- Installs Podman and cephadm on all storage nodes
- Bootstraps the first Ceph monitor node, creating the initial cluster with the FSID from inventory
- Fetches or verifies the `client.admin` keyring and stores it under `./assets/ceph/`
- Adds the remaining monitor nodes to the cluster and labels them as admin nodes
- Provisions OSDs on all storage nodes by zapping and claiming the disks listed in inventory (only when `provision_zap_disks: true`)
- Creates the RBD pools required by OpenStack (`images`, `volumes`, `backups`, `vms`) with replication and PG counts derived from inventory (`ceph.pg_count`, or auto-calculated if omitted)
- Generates or verifies CephX keyrings for the OpenStack service clients (glance, cinder, cinder-backup), writing them vault-encrypted to `./assets/ceph/`
- Runs a cluster health check as the final step and fails the playbook if the cluster is not in `HEALTH_OK` — a successful run confirms the cluster is operational
- Enables the Prometheus metrics exporter on the cluster

## Selective Execution

Use `--tags` to run a subset of the provisioning steps. This is useful when resuming a partial run or re-running a single phase after a failure.

| Tag | Description |
|-----|-------------|
| `ceph` | Run all provisioning steps |
| `ceph_validate` | Pre-flight inventory and SSH checks only |
| `ceph_bootstrap` | Install cephadm and bootstrap the first monitor node |
| `ceph_nodes` | Add remaining nodes and fetch the admin keyring |
| `ceph_expand` | Add nodes, provision OSDs, and run a health check |
| `ceph_osds` | OSD provisioning only |
| `ceph_pools` | Pool creation only |
| `ceph_keyrings` | Keyring verify, import, or generation |
| `ceph_health` | Cluster health check only |
| `ceph_observability` | Enable Prometheus metrics exporter |

Example: re-run only OSD provisioning:

```bash
./scripts/platform-setup.sh --provision-ceph --tags ceph_osds
```

For safely taking a storage node offline for maintenance, see the [Ceph node maintenance](./runbooks/CEPH_NODE_MAINTENANCE) runbook.

## Verify Cluster is Ready

Before promoting keyrings or starting the RADOS Gateway setup, confirm the cluster is healthy and PG autoscaling has completed.

Connect to any Ceph monitor node and enter the cephadm shell:

```bash
ssh <ceph-node>
sudo cephadm shell
```

Check overall cluster status — it should report `HEALTH_OK`:

```bash
ceph -s
```

Check that PG autoscaling has settled on all pools. The `pg_num` and `pg_num_target` columns should match for every pool before proceeding — a high initial `pg_num` is expected and will be scaled down automatically:

```bash
ceph osd pool autoscale-status
```

To check a specific pool individually:

```bash
ceph osd pool get <pool> pg_num
```

The relevant pools are `images`, `volumes`, `backups`, and `vms`. Only proceed to the next step once all pools show matching `pg_num` and `pg_num_target` and the cluster is in `HEALTH_OK`.

## After Provisioning: Promote Keyrings

The playbook writes vault-encrypted keyrings to `./assets/ceph/` after each run. Copy them to `./keyrings/` before running the OpenStack deployment:

```bash
cp ./assets/ceph/*.keyring ./keyrings/
```

The `./keyrings/` directory should contain the following files after promotion:

```bash
keyrings/
├── ceph.client.admin.keyring
├── ceph.client.cinder-backup.keyring
├── ceph.client.cinder.keyring
└── ceph.client.glance.keyring
```

The three service keyrings (`cinder`, `cinder-backup`, and `glance`) are mounted read-only into the deployment container and consumed by OpenStack. The admin keyring is how `--provision-ceph` recognises an existing cluster: on subsequent runs it compares the stored key against the live cluster and aborts if they differ, preventing accidental re-bootstrapping of an existing installation. See the [Ceph Keyrings](./DEPLOYMENT#ceph-keyrings) section of the Deployment guide for how the service keyrings are referenced in `inventory.yml`.

:::note

The keyring role selects one of three modes per keyring based on local state:

- **Fetch mode** (keyring absent from `./keyrings/`): runs `ceph auth get-or-create`, which returns the existing key if the CephX client already exists on the cluster, or generates a new one if not. Running against an established cluster without a local copy re-fetches the live key rather than regenerating it
- **Verify mode** (keyring present in `./keyrings/`): SHA256-compares the stored key against the live cluster. Fails if they differ, catching out-of-band key changes before deployment
- **Import mode** (keyring present in `./keyrings/`, CephX client absent from cluster): imports the provided key and caps into the cluster, then falls through to verify

:::

## RADOS Gateway

The RADOS Gateway (RGW) provides S3-compatible object storage and Keystone authentication integration for the OpenStack Swift and S3 endpoints. RGW is required for an AI Factory deployment — it backs the Swift and S3 object storage endpoints exposed to tenants. Its setup spans two points in the deployment timeline: gateway service and admin user before OpenStack, Keystone integration after. **Complete steps 1–3 before running `platform-setup.sh`** — the OpenStack deployment requires the RGW credentials to be present in `inventory.yml`.

### Before OpenStack deployment

Connect to any Ceph monitor node and enter the cephadm shell:

```bash
ssh <ceph-node>
sudo cephadm shell
```

#### 1. Start the gateway service

:::warning

**Skip this step if TLS is enabled.** Running `ceph orch apply rgw gateway` with a plain spec overwrites the stored RGW service spec and strips the TLS certificate block, breaking HTTPS on the gateway. If `ceph_rgw_tls_enabled: true` is set in your inventory, the Ansible provisioning playbook (`--tags ceph_rgw_tls`) already applied the correct TLS-enabled spec.

:::

The guard below aborts if TLS is already configured on the cluster. Run from the storage node — not from inside a cephadm shell:

```bash
RGW_HOSTS="<hostname-1> <hostname-2> <hostname-3>"  # from: sudo cephadm shell -- ceph orch host ls

if sudo cephadm shell -- ceph orch ls rgw --export 2>/dev/null | grep -q "ssl: true"; then
  echo "ERROR: RGW is configured with TLS — this command would remove TLS certificates. Aborting." >&2
else
  sudo cephadm shell -- ceph orch apply rgw gateway --placement="3 $RGW_HOSTS" --port=8080
fi
```

#### 2. Create the gateway admin user

```bash
radosgw-admin user create \
  --uid="iaas-rgw-admin" \
  --display-name="iaas management user for ceph object gateway admin API" \
  --caps="users=*;buckets=*;usage=*;metadata=*"
```

Note the `access_key` and `secret_key` values from the command output.

#### 3. Write access and secret keys to inventory

Exit the cephadm shell and run the following commands **on the bastion** to encrypt the keys:

```bash
ansible-vault encrypt_string '<access_key_value>' --name 'rgw_auth.access_key' --ask-vault-pass
ansible-vault encrypt_string '<secret_key_value>' --name 'rgw_auth.secret_key' --ask-vault-pass
```

Copy the encrypted output into `inventory.yml`:

```yaml
rgw_auth:
  access_key: !vault |
    $ANSIBLE_VAULT;1.1;AES256
    ...
  secret_key: !vault |
    $ANSIBLE_VAULT;1.1;AES256
    ...
```

### After OpenStack deployment

The `configure_ceph_rgw_keystone` post-deployment role handles Ceph RGW Keystone integration. Enable it in your inventory and run the post-deployment playbook:

```yaml
post_deployment:
  configure_ceph_rgw_keystone:
    active: true
```

```bash
ansible-playbook post-deployment.yml \
  -i <inventory> \
  --vault-password-file <vault-password-file> \
  --extra-vars "cluster_directory=<path>"
```

The role configures the Keystone URL, admin credentials, accepted roles, implicit tenants, SSL verification, and S3 authentication. If you need to set `rgw_keystone_token_cache_size`, `rgw_enable_usage_log`, or `rgw_swift_account_in_url`, apply them manually via `ceph config set`, for example:

```bash
ceph config set client.rgw.gateway rgw_enable_usage_log true
```

If using SSL verification, complete the following steps. The RGW containers are RHEL-based and look for the CA bundle at `/etc/pki/tls/certs/ca-bundle.crt` — not the Ubuntu path — so the host CA bundle must be explicitly mounted into the container.

**Step 1 — Distribute the Keystone CA certificate**

Copy the Keystone CA certificate to **each storage node running RGW** and update the trust store:

```bash
sudo cp /path/to/keystone-ca.crt /usr/local/share/ca-certificates/keystone-ca.crt
sudo update-ca-certificates
ls -la /etc/ssl/certs/keystone-ca.pem
```

Expected output:

```
lrwxrwxrwx 1 root root 48 ... /etc/ssl/certs/keystone-ca.pem -> /usr/local/share/ca-certificates/keystone-ca.crt
```

If the symlink is absent on any RGW host, re-copy the cert and re-run `update-ca-certificates` on that host before continuing.

**Step 2 — Export the current RGW spec**

```bash
sudo cephadm shell -- ceph orch ls rgw --export > ~/rgw-spec.yaml
cat ~/rgw-spec.yaml
```

**Step 3 — Extract the TLS cert in block-scalar format**

The spec export uses single-quoted YAML which folds newlines — do not copy the cert from there. Pull it directly from config-key:

```bash
sudo cephadm shell -- ceph config-key get rgw/cert/rgw.gateway | python3 -c "
import sys
cert = sys.stdin.read().strip()
print('  rgw_frontend_ssl_certificate: |')
for line in cert.split('\n'):
    print('    ' + line)
"
```

Copy the output — this is the correctly formatted block-scalar cert to paste into the spec.

**Step 4 — Update the spec file**

Edit `~/rgw-spec.yaml` and make two additions:

1. Replace the `rgw_frontend_ssl_certificate` value under `spec:` with the block-scalar output from step 3 (`|` format — never single-quoted).
2. Add `extra_container_args` at the top level (same indentation as `placement:` and `spec:`):

```yaml
extra_container_args:
  - "-v"
  - "/etc/ssl/certs/ca-certificates.crt:/etc/pki/tls/certs/ca-bundle.crt:ro"
```

**Step 5 — Apply the updated spec**

```bash
sudo cephadm shell --mount ~/rgw-spec.yaml:/tmp/rgw-spec.yaml -- \
  ceph orch apply -i /tmp/rgw-spec.yaml
```

Verify the spec was accepted — confirm `extra_container_args` appears and `ssl: true` / `rgw_frontend_ssl_certificate:` are intact:

```bash
sudo cephadm shell -- ceph orch ls rgw --export
```

After the spec is applied, the post-deployment playbook handles setting `rgw_keystone_verify_ssl true` and redeploying the RGW daemons. Confirm the daemons return to `running`:

```bash
sudo cephadm shell -- ceph orch ps --daemon-type rgw
```

**Step 6 — Verify Keystone SSL is working**

```bash
RGW_CTR=$(sudo podman ps --filter "name=rgw" --format "{{.Names}}" | head -1)
sudo podman exec "$RGW_CTR" curl -v https://<keystone-host>:5000/v3/ 2>&1 \
  | grep -E "SSL certificate|verify|issuer|CAfile|error"
```

Expected:

```
*  CAfile: /etc/pki/tls/certs/ca-bundle.crt
* TLSv1.3 (IN), TLS handshake, CERT verify (15):
*  issuer: CN=KollaTestCA
*  SSL certificate verify ok.
```

Replace `<keystone-host>` with the value of `kolla_internal_fqdn` from `globals.yml`.

---

## Troubleshooting

Unless noted otherwise, `ceph` commands in this section must be run inside a `cephadm shell` on any monitor node:

```bash
ssh <ceph-node>
sudo cephadm shell
```

### How to identify which phase failed

The playbook prints the failing task name before exiting. Match the symptom to the phase below, then re-run with the corresponding `--tags` value after resolving the error.

| Symptom in Ansible output | Resume with `--tags` |
|---|---|
| Failure during cephadm install or `bootstrap` task on the first monitor node | `ceph_bootstrap` |
| Failure adding a monitor node or fetching the admin keyring | `ceph_nodes` |
| Failure during OSD creation (`ceph orch apply osd`) | `ceph_osds` |
| Failure creating RBD pools | `ceph_pools` |
| Failure during keyring generation or import | `ceph_keyrings` |
| Final health check fails — cluster not in `HEALTH_OK` | `ceph_health` |

Example: OSD provisioning failed, bootstrap succeeded:

```bash
./scripts/platform-setup.sh --provision-ceph --tags ceph_osds
```

### Bootstrap succeeded but no OSDs were created

Verify `provision_zap_disks: true` is set in inventory — without it, the OSD step completes silently with no disks claimed. Confirm the current state:

```bash
ceph osd tree
```

If the tree shows no OSDs, set `provision_zap_disks: true` and re-run:

```bash
./scripts/platform-setup.sh --provision-ceph --tags ceph_osds
```

### OSD provisioning fails — device already in use

The target disk may have an existing partition table or OSD signature from a previous run. SSH to the storage node (outside the cephadm shell) and check the disk layout:

```bash
lsblk /dev/<disk>
```

If the disk has existing partitions or an OSD label and it is safe to erase, confirm `provision_zap_disks: true` is set and re-run the OSD phase. If the playbook still fails, zap the disk manually before re-running:

```bash
cephadm ceph-volume lvm zap /dev/<disk> --destroy
```

### Cluster does not reach `HEALTH_OK` after provisioning

Run the health check phase to get current status and watch for ongoing events:

```bash
./scripts/platform-setup.sh --provision-ceph --tags ceph_health
ceph -w
```

Common causes: not enough OSDs to satisfy the replication factor, or a monitor that has not fully joined. Check:

```bash
ceph osd stat
ceph mon stat
```

If a monitor is missing, re-run the node expansion phase:

```bash
./scripts/platform-setup.sh --provision-ceph --tags ceph_nodes
```

### FSID mismatch — playbook refuses to manage existing cluster

If the playbook fails with an FSID mismatch error, retrieve the actual FSID from any monitor node and update `ceph_fsid` in inventory to match:

```bash
ceph fsid
```

### Keyring files missing from `./assets/ceph/` after a successful run

Re-run the keyring phase:

```bash
./scripts/platform-setup.sh --provision-ceph --tags ceph_keyrings
```

If the keyrings already exist in the cluster but were not written locally, check the vault password and write permissions under `./assets/`.
