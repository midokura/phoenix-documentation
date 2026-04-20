# Setup Ceph

Provisioning Ceph storage clusters via script on dedicated nodes.

You can provision a Ceph storage cluster on dedicated nodes using the automated provisioning script. The script runs an Ansible playbook that handles the full lifecycle: installation, bootstrapping, node expansion, OSD provisioning, pool creation, and keyring generation.

## Prerequisites

### Inventory variables

The following variables must be set in `inventory.yml` before running the provisioning playbook:

| Variable | Required | Default | Description |
| -------- | -------- | ------- | ----------- |
| `ceph_mon_hosts` | Yes | - | List of Ceph monitor/storage node hostnames |
| `ceph_mon_ips` | Yes | - | Storage VPC IPs, one per entry in `ceph_mon_hosts` |
| `ceph.public_network` | Yes | - | Storage VPC CIDR (e.g. `10.33.0.0/24`) |
| `ceph_fsid` | Yes | - | Stable cluster UUID; generate once with `uuidgen` and commit to inventory |
| `ceph.osd_replication` | Yes | `2` | OSD replication factor |
| `provision_zap_disks` | No | `false` | Must be `true` to allow disk erasure for OSD creation |

:::warning

`provision_zap_disks` controls if the playbook erases OSD disks before claiming them.

- **Fresh disks / first-time provisioning**: set `provision_zap_disks: true`. Without it, the playbook will skip disk erasure and no OSDs will be created on uninitialized disks.
- **Reprovisioning nodes with existing OSDs**: leave as `false` (the default) to keep existing OSD data intact.

Only set `provision_zap_disks: true` when you are certain the target disks can be wiped.

:::

### Storage node OS

All storage nodes listed in `ceph_mon_hosts` must have Ubuntu installed and be reachable via SSH from the bastion before running `--provision-ceph`.

In an AI Factory deployment this is handled by the bootstrap phase (`platform-setup.sh --bootstrap`), which provisions the OpenWRT router VM and configures it as the DHCP/iPXE server for the provision network. HedgeHog provides the network underlay and manages the VPCs: the provision VPC is used to iPXE-boot and install the OS on all nodes, while the storage VPC carries Ceph replication and OSD traffic and maps to `ceph.public_network` in the inventory. Once the bootstrap phase completes and the nodes are up, they are ready for Ceph provisioning.

The connecting user requires passwordless `sudo` on each node.

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
- Creates the RBD pools required by OpenStack (`images`, `volumes`, `backups`, `vms`) with replication and PG counts derived from inventory
- Generates or verifies CephX keyrings for the OpenStack service clients (glance, cinder, cinder-backup), writing them vault-encrypted to `./assets/ceph/`
- Runs a cluster health check and fails the playbook if the cluster is not in `HEALTH_OK` or `HEALTH_WARN` state
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

- **Fetch mode** (keyring absent from `./keyrings/`): runs `ceph auth get-or-create`, which returns the existing key if the CephX client already exists on the cluster, or generates a new one if not. Running against an established cluster without a local copy re-fetches the live key rather than regenerating it.
- **Verify mode** (keyring present in `./keyrings/`): SHA256-compares the stored key against the live cluster. Fails if they differ, catching out-of-band key changes before deployment.
- **Import mode** (keyring present in `./keyrings/`, CephX client absent from cluster): imports the provided key and caps into the cluster, then falls through to verify.

:::

## RADOS Gateway

The RADOS Gateway (RGW) provides S3-compatible object storage and Keystone authentication integration for the OpenStack Swift and S3 endpoints. Its setup spans two points in the deployment timeline: gateway service and admin user before OpenStack, Keystone integration after.

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

Encrypt the keys with ansible-vault and add them to `inventory.yml`:

```bash
ansible-vault encrypt_string '<access_key_value>' --name 'rgw_auth.access_key'
ansible-vault encrypt_string '<secret_key_value>' --name 'rgw_auth.secret_key'
```

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

Replace `<keystone-host>` with the hostname or IP of the OpenStack controller.

#### 6. Restart the gateway service

```bash
ceph orch restart rgw.gateway
```

