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

```bash
ceph orch apply rgw gateway --placement="3 <hostname-1> <hostname-2> <hostname-3>" --port=8080
```

Replace the hostnames with three Ceph nodes from your inventory (`ceph orch host ls` lists them).

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
ansible-vault encrypt_string '<access_key_value>' --name 'rgw_auth.access_key' --vault-password-file ~/vault-key.txt
ansible-vault encrypt_string '<secret_key_value>' --name 'rgw_auth.secret_key' --vault-password-file ~/vault-key.txt
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

:::note

The following steps require the live OpenStack Keystone endpoint. Run them after completing the OpenStack deployment described in [DEPLOYMENT](./DEPLOYMENT).

The config settings below (URL, admin user, domain, project, and flags) are manual. The Keystone **password** is the exception: set `post_deployment.configure_ceph_rgw_keystone.active: true` in `inventory.yml` and the post-deployment playbook will read it from `passwords.yml` and restart the gateway automatically — no need to set it manually or run step 6.

:::

#### 4. Distribute the Keystone CA certificate

The cephadm RGW containers use the host system CA bundle. Copy the Keystone CA certificate to **each Ceph node** listed in `ceph_mon_hosts` and update the trust store:

```bash
sudo cp /path/to/keystone-ca.crt /usr/local/share/ca-certificates/keystone-ca.crt
sudo update-ca-certificates
```

#### 5. Configure Keystone integration

Connect to a Ceph monitor node, enter the cephadm shell, and run:

```bash
# https://docs.ceph.com/en/latest/radosgw/keystone/
# As of the Queens release, Keystone solely implements the Identity API v3.
# Support for Identity API v2.0 has been removed in Queens in favor of the Identity API v3.
# https://docs.openstack.org/keystone/latest/contributor/http-api.html
ceph config set client.rgw.gateway rgw_keystone_api_version 3
ceph config set client.rgw.gateway rgw_keystone_url https://<keystone-host>:5000
ceph config set client.rgw.gateway rgw_keystone_verify_ssl true
ceph config set client.rgw.gateway rgw_keystone_admin_user ceph_rgw
ceph config set client.rgw.gateway rgw_keystone_admin_domain Default
ceph config set client.rgw.gateway rgw_keystone_admin_project service

# disable token cache because of https://tracker.ceph.com/issues/21226
ceph config set client.rgw.gateway rgw_keystone_token_cache_size 0

ceph config set client.rgw.gateway rgw_enable_usage_log true # logging

# https://docs.ceph.com/en/latest/radosgw/multitenancy/#swift-with-keystone
ceph config set client.rgw.gateway rgw_keystone_implicit_tenants true

# options
ceph config set client.rgw.gateway rgw_swift_account_in_url false

# https://docs.ceph.com/en/latest/radosgw/s3/authentication/
ceph config set client.rgw.gateway rgw_s3_auth_use_keystone true
```

Replace `<keystone-host>` with the value of `kolla_internal_fqdn` from `globals.yml` — the FQDN (or IP, if no DNS is configured) that maps to the OpenStack internal VIP.

#### 6. Restart the gateway service

:::note

If you set `post_deployment.configure_ceph_rgw_keystone.active: true` in `inventory.yml`, the post-deployment playbook restarts the gateway automatically after writing the Keystone password — skip this step.

:::

```bash
ceph orch restart rgw.gateway
```

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
