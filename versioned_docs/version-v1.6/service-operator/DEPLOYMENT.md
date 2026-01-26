# Deployment Scripts

Deploying GPU infrastructure clusters.

This guide walks you through deploying GPU infrastructure clusters using containerized Ansible automation.
The deployment scripts handle the complete setup of OpenStack, management clusters, and observability stack on physical infrastructure.

**Getting the Release Package:**

Download the latest release from the provided URL

## Before You Start

Before running the deployment, you need to prepare several things. We'll go through them one by one.

**Note:** All default paths below can be customized using CLI arguments (see [Options and Configuration](#options-and-configuration)).

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
  1. The script prompts you to enter the password interactively at the beginning
  2. It temporarily stores the password in `~/vault-key.txt` during execution
  3. The file is automatically removed when the script completes
- **What you need:** Just know the password - the script handles the file creation and cleanup
- **Important:** The local file `~/vault-key.txt` will be mounted in the container as `/secrets/vault-key.txt` read-only file

### SSH Keys

- **What it is:** SSH private keys to access cluster nodes
- **Location:** `~/.ssh/` directory and `~/.ssh/id_ed25519` as default private key
- **Purpose:**
  - Used for: Deploying OpenStack on physical controller nodes and accessing management VMs (management cluster, observability services)
  - Variable in inventory.yml: `ansible_ssh_private_key_file`
  - Test access: `ssh -i ~/.ssh/management-key.pem root@your-controller-hostname`
  - Create the keypair if needed: `ssh-keygen -t ed25519 -f ~/.ssh/management-key.pem`
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

**Note:** All commands below assume you're in the `release-assets/` directory.

### First-Time Setup

1. Connect into the bastion host with ssh: `ssh ubuntu@<bastion0 domain>`.
2. Download the release package from the provided URL: `curl <artifact url> -O release-assets.tar.gz`
3. Extract the tar.gz archive into a folder called `release-assets`:
`mkdir release-assets && tar -xzf release-assets.tar.gz -C release-assets`
4. Change to release directory: `cd release-assets`
5. Verify checksums: `sha256sum -c SHA256SUMS`
6. Copy the crafted `inventory.yml` into the bastion: `scp ./inventory.yml ubuntu@<bastion0 domain>:release-assets/`

### Complete Deployment

1. Run master script: `./scripts/platform-setup.sh`
2. Enter vault password when prompted
3. Wait for deployment to complete (1-2 hours)
4. Review logs in `logs/`
5. Verify services are running (see below)

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
| `--vault-file PATH` | `VAULT_FILE` | `~/vault-key.txt` | Vault password file |
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

- `VAULT_FILE` - Vault password file path (default: `~/vault-key.txt`)
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
# Verify vault file exists and has correct permissions
ls -l ~/vault-key.txt
chmod 600 ~/vault-key.txt
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

- Vault password is stored temporarily in `~/vault-key.txt`
- File is automatically removed when master script completes
- File has restrictive permissions (600) - only readable by owner
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

- Prompts for vault password once (stored temporarily)
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
