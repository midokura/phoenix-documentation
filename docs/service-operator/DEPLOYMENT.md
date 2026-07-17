---
sidebar_position: 50
---

# Deployment Scripts

Deploying GPU infrastructure clusters

This guide walks you through deploying GPU infrastructure clusters using containerized Ansible automation.
The deployment scripts handle the complete setup of OpenStack, management clusters, and observability stack on physical infrastructure.

**Getting the Release Package:**

The release package URL and its checksum URL are provided in the release email sent to `all@midokura.com`
with subject **"AI Factory v{VERSION} released"**.

## Before You Start

Before running the deployment, you need to prepare several things. We'll go through them one by one.

:::note

All default paths below can be customized using CLI arguments (see [Options and Configuration](#options-and-configuration)).

:::

### Prerequisites Checklist

Quick verification checklist. Click any item for detailed setup instructions below.

- [ ] **Container Runtime** - Podman or Docker installed → [Details](#container-runtime)
- [ ] **Registry Authentication** - Authenticated to ghcr.io for pulling private images → [Details](#registry-authentication)
- [ ] **Vault Password** - Know the password (will be prompted) → [Details](#vault-password)
- [ ] **SSH Keys** - Have controller access key in `~/.ssh/` → [Details](#ssh-keys)
- [ ] **Ceph Keyrings** - three keyring files in `./keyrings/` (cinder, cinder-backup, glance) → [Details](#ceph-keyrings)
- [ ] **Disk Space** - 30 GB free in `~/.cache/gpu-infrastructure/` for VM images → [Details](#vm-images)
- [ ] **Inventory File** - `./inventory.yml` present and valid → [Details](#inventory-file)

### Container Runtime

- **What it is:** Container runtime (Podman or Docker) to run the deployment automation
- **Purpose:** Runs the Ansible container with all deployment tools pre-installed
- **Where to get it:** Install [Podman](https://podman.io/docs/installation) or [Docker](https://docs.docker.com/get-started/get-docker/)

### Registry Authentication

- **What it is:** GitHub Container Registry (GHCR) credentials for pulling private container images
- **Purpose:** Required for deployment OSt and IaaS Console / Observability containers
- **Setup steps:**
  1. Create GitHub Personal Access Token with `read:packages` scope ([Token Settings](https://github.com/settings/tokens))
  2. Authenticate to registry:

     ```bash
     export CR_PAT=YOUR_TOKEN
     echo $CR_PAT | podman login ghcr.io -u USERNAME --password-stdin
     ```

  3. Encrypt token: `ansible-vault encrypt_string 'ghp_YourToken' --name 'ghcr_pat' --ask-vault-password`
  4. Add to `inventory.yml`:

     ```yaml
     all:
       vars:
         iaas_console:
           ghcr_user: "your-github-username"
           ghcr_pat: !vault |
             $ANSIBLE_VAULT;1.1;AES256
             ... encrypted token ...
     ```

- **Important:** Always encrypt PAT in inventory.yml, never commit unencrypted secrets

### Vault Password

- **What it is:** Password to decrypt and encrypt configuration files
- **Purpose:** Decrypts secrets in `inventory.yml` and other encrypted configuration files
- **How it works:**
  1. If the `VAULT_PASSWORD` environment variable is set, the script uses it automatically
  2. Otherwise the script prompts you to enter the password interactively
  3. The password is stored in a temporary file with restrictive permissions and deleted on exit via a signal trap
- **What you need:** Retrieve the vault password from [Bitwarden](https://vault.bitwarden.com/#/vault?organizationId=f28d9d48-9bab-4b62-943c-a96c0105b65c&search=vault&itemId=383a8ea4-f163-4673-af79-b3a800a5f248&action=view) (search "ansible vault"). The script will prompt you when you run it, or you can pre-set it to avoid being prompted:

```bash
read -rsp "Vault password: " VAULT_PASSWORD && export VAULT_PASSWORD
```

### SSH Keys

- **What it is:** SSH private keys to access cluster nodes
- **Location:** `~/.ssh/` directory and `~/.ssh/id_ed25519` as default private key
- **Purpose:**
  - Used for: Deploying OpenStack on physical controller nodes and accessing management VMs (management cluster, observability services)
  - Variable in inventory.yml: `ansible_ssh_private_key_file`
  - Test access: `ssh -i ~/.ssh/management-key.pem root@your-controller-hostname`
  - Create the keypair if needed: `ssh-keygen -t ed25519 -f ~/.ssh/management-key.pem`
  - Set correct permissions — SSH will refuse to use a key file that is not locked down:
    ```bash
    chmod 600 ~/.ssh/management-key.pem
    ```
- **Important:** Always use `~/.ssh/` paths in your `inventory.yml`. Your `~/.ssh/` directory is automatically mounted inside the container as a read-only directory

### Ceph Keyrings

- **What it is:** Authentication credentials for Ceph storage backend
- **Location:** `./keyrings/` directory

  ```
  keyrings/
  ├── ceph.client.cinder-backup.keyring
  ├── ceph.client.cinder.keyring
  └── ceph.client.glance.keyring
  ```

- **How to generate:** Run `platform-setup.sh --provision-ceph` to provision the Ceph cluster. After provisioning, copy the generated keyrings from `./assets/ceph/` to `./keyrings/`:

  ```bash
  cp ./assets/ceph/*.keyring ./keyrings/
  ```

  See [CEPH_SETUP](./CEPH_SETUP) for the full provisioning procedure and keyring promotion steps.

- **Purpose:** Allows OpenStack services (Cinder, Glance, Nova) to access Ceph storage
- **Inventory configuration:** Your `inventory.yml` should reference these files:

  ```yaml
  ceph_cinder_backup_keyring: "{{ playbook_dir }}/../../keyrings/ceph.client.cinder-backup.keyring"
  ceph_cinder_keyring: "{{ playbook_dir }}/../../keyrings/ceph.client.cinder.keyring"
  ceph_glance_keyring: "{{ playbook_dir }}/../../keyrings/ceph.client.glance.keyring"
  ceph_nova_keyring: "{{ playbook_dir }}/../../keyrings/ceph.client.cinder.keyring"
  ```

- **Important:** The local `./keyrings` will be mounted inside the container as `/keyrings` read-only directory.

### VM Images

- **What it is:** VM images (Cirros, Ubuntu, Phoenix with CUDA) for provisioning VMs and BMs
- **Location:** `~/.cache/gpu-infrastructure/images` (default)
- **Purpose:** First deployment downloads images, converts them from qcow2 to raw format, and uploads to OpenStack Glance. Subsequent deployments reuse cached images
- **Requirements:**
  - ~30 GB free disk space
  - Internet connectivity during first deployment to download the images if needed
- **Optional:** Pre-populate the cache directory if you have the images available offline
- **Important:** Your `~/.cache/gpu-infrastructure/` directory is automatically mounted inside the container at `/root/.cache/gpu-infrastructure` as a writable directory

### Inventory File

- **What it is:** Configuration file defining OpenStack cloud connection and resources (networks, flavors, images, VMs)
- **Location:** `./inventory.yml` in the release-assets directory
- **Template:** See `inventory.example.yml` for an example with configuration options
- **Purpose:** Tells Ansible how to connect to your OpenStack deployment and what resources to provision.
- **Important:** Your `./inventory.yml` file is automatically mounted inside the container at `/inventory.yml` as a read-only file

## Quick Start

:::note

All commands below assume you're in the `release-assets/` directory.

:::

### First-Time Setup

1. Connect into the bastion host with ssh: `ssh ubuntu@<deployment0 domain>`.
2. Download the release package and its checksum file using the URLs from the release email:
   ```bash
   curl -L -o ai-factory-<version>.tar.gz "<artifact-url>"
   curl -L -o ai-factory-<version>.tar.gz.sha256 "<checksum-url>"
   ```
3. Verify the integrity of the downloaded archive. The checksum file contains only the bare SHA-256 hash, so the verification command is:
   ```bash
   echo "$(cat ai-factory-<version>.tar.gz.sha256)  ai-factory-<version>.tar.gz" | sha256sum -c
   ```
   Expected output: `ai-factory-<version>.tar.gz: OK`
4. Extract the archive:
   ```bash
   mkdir release-assets && tar -xzf ai-factory-<version>.tar.gz -C release-assets
   ```
5. Change to release directory: `cd release-assets`
6. Verify checksums of the extracted contents: `sha256sum -c SHA256SUMS`
7. Copy the crafted `inventory.yml` into the bastion: `scp ./inventory.yml ubuntu@<deployment0 domain>:release-assets/`

### Complete Deployment

1. Bootstrap the network environment: `./scripts/platform-setup.sh --bootstrap`
2. Configure the switches following this
   [guide](NETWORK_CONTROL_NODE_SETUP.md#43-access-switch-console).
3. Deploy ceph: `/scripts/platform-setup.ph --provision-ceph`.
4. Run master script: `./scripts/platform-setup.sh`
5. Enter vault password when prompted (see [Vault Password](#vault-password))
6. Wait for deployment to complete (1-2 hours)
7. Review logs in `logs/`
8. Verify services are running (see below)

### Verify Deployment Success

After deployment completes, verify that all services are running correctly:

```bash
# Check that deployment completed successfully
tail -50 logs/main-*.log | grep -i "success\\|complete\\|failed"

# Verify OpenStack services (if OpenStack was deployed)
./scripts/platform-setup.sh --shell
source <(ansible-vault view --vault-password-file /secrets/vault-key.txt /infra-management/config/admin-openrc.sh)
openstack server list  # Should show VMs if management cluster/observability were deployed

# Verify management cluster (if management cluster was deployed)
export KUBECONFIG=/infra-management/kubeconfig
kubectl get nodes  # Should show Ready status
kubectl get pods -A  # Should show Running pods
```

**Success indicators:**

- ✅ All Ansible tasks completed without failures
- ✅ Management cluster nodes show "Ready" status
- ✅ All pods show "Running" or "Completed" status
- ✅ No error messages in logs

**If you see failures:**

- Check the logs in `logs/main-*.log` for error details
- See [Partial Execution](#partial-execution) below to retry specific steps

### End-to-End Acceptance Checklist

The infrastructure checks above confirm the control plane is up, but they do not verify that the product works end-to-end for a user. Complete the following checklist before announcing the environment as ready.

All commands below run from `bastion0` unless noted otherwise.

#### 1. Console public access

Verify the IaaS Console is reachable from a whitelisted external address (for example, from your office network or operator VPN):

```bash
# Replace with the values from your inventory:
#   cluster_name          - value of cluster_name in inventory
#   cluster_public_domain - value of cluster_public_domain in inventory
curl -vL -m 10 \
  https://console.<cluster_name>.<cluster_public_domain> \
  | grep -i title
```

Expected output: a line containing `IaaS UI`.

If this fails, retry using the console's public IP directly to distinguish a DNS failure from a routing failure:

```bash
curl -kvL -m 10 \
  https://10.32.0.24 \
  -H "Host: console.<cluster_name>.<cluster_public_domain>" \
  | grep -i title
```

If the DNS-based request fails but the IP-based request succeeds, the issue is DNS resolution. If both fail, the issue is in the router's DNAT or BGP routing. See checks 2 and 3 below.

#### 2. BGP routing health

SSH into the router and confirm that all BGP sessions are established, then verify that all floating IP `/32` routes are `unicast`, not `blackhole`. The FIP subnet `/24` blackhole route is expected (it is the aggregate announcement); individual `/32` entries must not be blackhole.

First, check that the upstream datacenter session and the OpenStack BGP speaker sessions are all in `ESTABLISHED` state:

```bash
ssh -i ssh_key root@10.30.0.1 birdc show protocol
```

Expected: the upstream datacenter peer and all `openstack_*` entries show `Established`. If any session is not established, resolve the BGP session issue before proceeding.

Then confirm the routes themselves:

```bash
ssh -i ssh_key root@10.30.0.1 birdc show route protocol openstack_control0
```

Expected: all entries show `unicast`. Example of a healthy entry:

```
119.15.113.17/32  unicast [openstack_control0 ...] * (100) [i]
    via <next_hop> on bond0.104
```

If any `/32` shows `blackhole`, the FIP subnet IP is not bound to an interface that BIRD's `direct` protocol can see as up. Check the `bird_bgp_direct_interfaces` inventory setting and the `vbgp` interface state on the router.

Before checking the router, verify on `bastion0` that all BGP dynamic routing agents are associated with the BGP speaker:

```bash
export SPEAKER_ID=$(openstack bgp speaker list -f value -c ID)
openstack bgp dragent list --bgp-speaker "$SPEAKER_ID"
```

Expected: all control nodes (`control0`, `control1`, `control2`) appear in the list with `Alive = True` and `State = True`. If any node is missing, the BGP speaker is not distributing routes through that agent and floating IPs announced from it will not be advertised to the router.

#### 3. IP whitelists populated

Verify the operator IP whitelist is not empty on the router. An empty whitelist causes the DNAT firewall rules to reference an undefined set and silently drop all inbound traffic.

```bash
ssh -i ssh_key root@10.30.0.1

nft list set inet fw4 allow_operators

ls /etc/iplists/ # should show operator and tenant lists
```

Expected: the set exists and contains at least one IP entry, and `/etc/iplists/` shows both operator and tenant list files. If the set is empty or does not exist, follow the [Apply IP List](./runbooks/APPLY_IPLIST.md) runbook before proceeding.

#### 4. Hedgehog fabric state

If this is a redeployment (not a first-time install), confirm that the Hedgehog controller was reprovisioned cleanly and holds no tenant networks from the previous deployment. Leftover networks cause VPC subnet conflicts when the IaaS Console tries to create the default tenant.

First, check directly on Hedgehog for stale VPCs. The VPC name prefix matches the beginning of the OpenStack tenant ID, so any entry here from a previous deployment indicates leftover state:

```bash
kubectl get vpc
kubectl get vpcattachment
```

Expected: both lists are empty (no entries from previous deployments). If stale VPCs are present, destroy and reprovision the Hedgehog VM before continuing.

Then create a test tenant via the IaaS API and check the IaaS API logs for VPC overlap errors:

```bash
# Set up your operator token and API base URL (see OPERATOR_API_GUIDE.md)
export API_BASE_URL="https://console.<cluster_name>.<cluster_public_domain>/api"
export JWT_TOKEN="<your-operator-jwt-token>"

# Create a test tenant and capture its ID
export TENANT_ID=$(curl -v -X POST \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "acceptance-test", "users": []}' \
  "${API_BASE_URL}/tenants" \
  | jq -r '.id')
```

Then add yourself to the tenant so you can access its resources in subsequent checks:

```bash
# Get your user ID
export USER_ID=$(curl -v \
  -H "Authorization: Bearer $JWT_TOKEN" \
  "${API_BASE_URL}/users/me" | jq -r '.id')

# Assign yourself to the test tenant
curl -v -X PUT \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}' \
  "${API_BASE_URL}/tenants/${TENANT_ID}/users/${USER_ID}"
```

Expected: HTTP 204 No Content.

#### 5. VPN agent health

After creating the test tenant above, verify that its VPN agent reconciles successfully. A failing VPN agent means users will not receive VPN access.

```bash
# Scope the OpenStack client to the test tenant
export OS_PROJECT_NAME="$TENANT_ID"

# List VPN servers in the test tenant
openstack server list | grep -i vpn-server
```

All VPN servers should be in `ACTIVE` state. Then confirm there are no active reconciliation errors in Grafana. The Grafana URL follows the pattern `https://grafana.<cluster_name>.<cluster_public_domain>/`. In **Grafana > Explore**, select **Prometheus** and run:

```
rate(vpn_agent_reconciliation_errors_total[10m])
  * on(instance) group_left(tenant_id)
  (vpn_agent_info)
```

Expected: the query returns no data or all series have value `0`. If errors are firing for the test tenant, follow the [VPN Agent Reconciliation Failure](./runbooks/VPN_RECONCILIATION_FAILURE.md) runbook.

#### 6. Floating IP reachability

Verify that the VPN server VM in the test tenant is reachable from an external whitelisted address. This confirms the full routing path: BGP announcement, DNAT, and return path via the BGP tunnel.

The VPN agent automatically assigns a floating IP to the VPN server when the tenant is created. Retrieve it from the output of the previous step:

```bash
openstack server list | grep -i vpn-server
```

The addresses column shows both the tenant network private IP and the public floating IP, for example:
`vpn_public_network=10.30.26.160, 119.15.113.109`

Use the second address (the public one) to verify reachability from your operator workstation:

```bash
nc -zvu <floating_ip> 51820
```

Expected: `Connection to <floating_ip> 51820 port [udp/*] succeeded!`. Connectivity confirms the DNAT and PBR rules are working.

If connectivity fails, check for traffic asymmetry:

1. From your operator workstation, run `mtr` toward the VPN server's floating IP:

   ```bash
   mtr --report --report-cycles 10 <floating_ip>
   ```

2. SSH into the VPN server (via the WireGuard tunnel set up in check 8) and run `mtr` back toward your operator workstation's public IP:

   ```bash
   mtr --report --report-cycles 10 <your_operator_public_ip>
   ```

3. Compare the two outputs. The hops in run 2 should be the reverse of the hops in run 1 — same routers, same interfaces, opposite order. For example, if the outbound path is `workstation → router → VPN server`, the return path must be `VPN server → router → workstation`, not `VPN server → some other gateway → workstation`.

If the return path exits through a different gateway, the VPN server's default route is not pointing back through the BGP tunnel. Check the PBR rules and the `wg_*` interface routing table on the router.

#### 7. Object storage

Verify that Ceph RADOS Gateway is serving S3-compatible object storage correctly. Create a storage bucket from the IaaS Console under the test tenant and confirm it is listed after creation.

If bucket creation fails with a certificate or connectivity error, check that the RGW Keystone integration was completed after deployment (see Software Installation step 5 in [OPERATOR_OVERVIEW](./OPERATOR_OVERVIEW.md)), and verify the RGW certificate:

```bash
# On a Ceph node (or via the Ansible container):
RGW_CTR=$(sudo podman ps --filter "name=rgw" --format "{{.Names}}" | head -1)
sudo podman exec "$RGW_CTR" \
  curl -v https://<keystone_host>:5000/v3/ 2>&1 \
  | grep -E "SSL certificate|verify|issuer|CAfile|error"
```

Expected: no TLS errors. If Keystone certificate verification fails, redistribute the CA certificate to the Ceph nodes and restart the gateway (see [CEPH_SETUP](./CEPH_SETUP.md)).

#### 8. VM provisioning and SSH access

Verify that a user can provision a VM through the IaaS Console and reach it over SSH. This confirms that the compute, networking, and VPN paths are all working end-to-end.

1. Log into the IaaS Console as the test tenant user.
2. Create a VM using any available flavor and image.
3. Once the VM reaches `ACTIVE` state, set up WireGuard VPN access for the test user following the [VPN Configuration](./VPN_CONFIGURATION.md) guide. This involves adding the user to the tenant with their public key and fetching the generated VPN configuration script.
4. Activate the WireGuard tunnel:

```bash
sudo wg-quick up <config>.conf
```

5. SSH into the VM using the private IP shown in the Console:

```bash
ssh ubuntu@<vm_private_ip>
```

Expected: the SSH session opens successfully. If the connection times out, verify that the VPN agent is healthy (check 5) and that the WireGuard tunnel is active (`sudo wg show`) before retrying.

5. From inside the VM, verify outbound internet connectivity:

```bash
curl -vL --max-time 10 https://docs.midokura.com -o /dev/null && echo "OK"
```

Expected: `OK`. If the request times out, the VM's default route or NAT is not configured correctly.

#### Acceptance complete

Once all eight checks pass, delete the test tenant to leave the environment clean.

Before deleting, move yourself to a different tenant. The API does not allow
deleting the tenant you are currently assigned to. Reassign yourself to the
Default tenant first:

```bash
# Get the Default tenant ID
DEFAULT_TENANT_ID=$(curl -v \
  -H "Authorization: Bearer $JWT_TOKEN" \
  "${API_BASE_URL}/tenants" \
  | jq -r '.[] | select(.name == "Default tenant") | .id')

# Move yourself to the Default tenant
curl -v -X PUT \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}' \
  "${API_BASE_URL}/tenants/${DEFAULT_TENANT_ID}/users/${USER_ID}"
```

Then delete the test tenant:

```bash
curl -v -X DELETE \
  -H "Authorization: Bearer $JWT_TOKEN" \
  "${API_BASE_URL}/tenants/${TENANT_ID}"
```

The environment is ready for end users when all checks pass without errors.

### Partial Execution

Use `--tags` and `--skip-tags` to control which steps run.
See ([full list](#available-ansible-tags)) of available tags for more details.

```bash
# Run specific components
./scripts/platform-setup.sh --tags openstack
./scripts/platform-setup.sh --tags openstack,provision-demo

# Skip specific components
./scripts/platform-setup.sh --skip-tags observability

# Combine with script flags and other options
./scripts/platform-setup.sh --skip-load-container --inventory custom.yml --tags management -vvv
```

## Options and Configuration

### Configuration Methods

**Priority order:** CLI arguments > Environment variables > Defaults (CLI args recommended)

```bash
# Example: CLI arguments override environment variables
export INVENTORY=old.yml
./scripts/platform-setup.sh --inventory new.yml  # Uses new.yml
```

### Script-specific Options

#### platform-setup.sh

These control the behavior of the main deployment script:

- `--shell` - Open interactive shell in container (skips deployment)
- `--skip-load-container` - Skip container loading step
- `--help` - Show help message

#### load-container.sh

These control the container image loading (one-time setup):

- `--image-file PATH` - Path to container image tar file (default: `./container-image.tar`)
- `--help` - Show help message

### Common Configuration Options

These options are shared across all scripts and can be specified via CLI arguments or environment variables:

| CLI Argument | Environment Variable | Default | Description |
|--------------|---------------------|---------|-------------|
| `-i, --inventory PATH` | `INVENTORY` | `./inventory.yml` | Ansible inventory file |
| `--ssh-dir PATH` | `SSH_DIR` | `~/.ssh` | SSH directory path |
| `--cache-dir PATH` | `CACHE_DIR` | `~/.cache/gpu-infrastructure` | Cache directory for images |
| `--keyrings-dir PATH` | `KEYRINGS_DIR` | `./keyrings` | Ceph keyrings directory |
| `--assets-dir PATH` | `ASSETS_DIR` | `./assets/` | Generated assets directory |

These are configured via environment variables only:

- `LOG_DIR` - Log directory (default: `./logs`)

Container image:

- `IMAGE_NAME` - Container image name (default: `ghcr.io/midokura/gpu-infra-ansible`)
- `IMAGE_TAG` - Container image tag (default: `release`)

All other arguments are passed directly to `ansible-playbook`:

- `--tags TAG1,TAG2` - Run specific tagged steps ([docs](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_tags.html#selecting-or-skipping-tags-when-you-run-a-playbook))
- `--skip-tags TAG1,TAG2` - Skip specific tagged steps
- `--extra-vars KEY=VALUE` - Pass additional variables to playbook (for example, `--extra-vars "debug=true"`) ([docs](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_variables.html#defining-variables-at-runtime))
- `-v`, `-vv`, `-vvv` - Verbose output
- Any other ansible-playbook flags

### Environment Variables

All scripts use common environment variables defined in `common.sh`:

**Input parameters:**

- `VAULT_PASSWORD` - Vault password (if unset, the script prompts interactively)
- `SSH_DIR` - SSH directory path (default: `~/.ssh`)
- `CACHE_DIR` - Cache directory for images and Ansible facts (default: `~/.cache/gpu-infrastructure`)
- `KEYRINGS_DIR` - Ceph keyrings directory (default: `./keyrings`)
- `INVENTORY` - Ansible inventory file (default: `./inventory.yml`)

**Output parameters:**

- `LOG_DIR` - Log directory (default: `./logs`)
- `ASSETS_DIR` - Generated assets directory (default: `./assets/`)

### Available Ansible Tags

| Tag | Description | Sub-tags |
|-----|-------------|----------|
| `openstack` | Deploy OpenStack via Kolla-Ansible | `config`, `deploy`, `provision`, `encrypt` |
| `management` | Deploy management cluster | `management-create`, `management-deploy` |
| `observability` | Deploy observability stack | `remote-metrics` |

## Logs

Deployment logs are stored in `logs/`:

```
logs/
├── load-container-YYYYMMDD-HHMMSS.log
└── main-YYYYMMDD-HHMMSS.log
```

The `main-YYYYMMDD-HHMMSS.log` contains output from all deployment steps executed in a single run.

Each log file contains:

- Timestamped console output
- Ansible playbook execution details
- Error messages and stack traces
- Execution timing information

## Troubleshooting

### Container not found

```bash
# Check if image is loaded
podman images | grep gpu-infra-ansible

# Load container if missing
./scripts/load-container.sh
```

### Vault password errors

```bash
# Check that VAULT_PASSWORD is set, or re-run the script and enter the password when prompted
echo "${VAULT_PASSWORD:+set}"
```

### SSH connection failures

```bash
# Verify SSH access to cluster nodes
ssh root@roquefort.bcn
ssh root@idiazabal.bcn
```

### Script failures

```bash
# Check logs for details
tail -f logs/*.log

# Run with verbose output
./scripts/platform-setup.sh -vvv
```

## Security Notes

- Vault password travels as the `VAULT_PASSWORD` environment variable — never transferred as a file between hosts
- A temporary file is created locally with restrictive permissions (umask 077) and deleted on exit via a signal trap (normal exit, SIGTERM, SIGINT)
- Never commit vault password to version control
- Keep vault password in a safe place

## Support

For issues or questions:

1. Check logs in `logs/`
2. Review script help: `./scripts/<script-name>.sh --help`
3. Run individual scripts for debugging
4. Contact infrastructure team

### File Structure

```
release-assets/
├── container-image.tar         # Pre-built Ansible container
├── scripts/                    # Deployment scripts
│   ├── common.sh               # Shared library (sourced by all scripts)
│   ├── platform-setup.sh       # Master orchestration script
│   └── load-container.sh       # Load container image
├── manifest.txt                # Build manifest
├── SHA256SUMS                  # Checksums
└── README.md                   # This file

Additional files needed for deployment:
├── inventory.yml               # Ansible inventory (environment-specific)
└── keyrings/                   # Ceph client keyrings (environment-specific)
```

### Scripts Overview

**`platform-setup.sh`** - Thin wrapper for deployment

- Reads `VAULT_PASSWORD` env var, or prompts once if unset (stored in a secure temporary file, deleted on exit)
- Loads container image (optional `--skip-load-container`)
- Passes all arguments directly to `ansible-playbook`
- Runs master playbook (`main.yml`) with user-provided Ansible flags: `--tags`, `--skip-tags`, `-v`, etc.
- Automatic cleanup of temporary files

**`load-container.sh`** - Load container image (one-time setup)

- Loads pre-built Ansible container from tar file
- Verifies image loaded successfully

**`common.sh`** - Shared library for all scripts

- Container runtime detection (Podman/Docker)
- Common validation functions (vault, SSH, keyrings, inventory)
- Ansible playbook execution wrapper
- Error handling and cleanup utilities

## Timeline

Typical deployment times (may vary):

- Load container: 2-5 minutes
- Deploy OpenStack: 30-60 minutes
- Deploy management cluster: 5-10 minutes
- Provision observability: 5-10 minutes

**Total: ~1-2 hours**
