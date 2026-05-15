---
sidebar_position: 10
---

# IaaS Console Configuration

Configuring JSON for the IaaS Console.

This document explains the JSON configuration for the IaaS Console API Helm Chart.

## Configuration Sections

### 1. Initial Users

To create initial users add them into the `operator_users` list in the inventory. This list should contain only the emails for each user. Users will be added to the default tenant as Operators.

Example:
```yaml
operator_users:
  - "user1@example.com"
  - "user2@example.com"
```

### 2. Flavors

Defines available VM instance types.

**Structure**:
```json
{
  "display_name": "Human-readable name",
  "ost_name": "openstack-flavor-name",
  "node_type": "baremetal"
}
```

**Fields**:
- **display_name**: Name shown in UI
- **ost_name**: OpenStack flavor name
- **node_type**: Optional (e.g., "baremetal" for physical servers)


### 3. Networks

Defines available networks for VMs.

**Structure**:
```json
{
  "display_name": "Human-readable name",
  "ost_name": "openstack-network-name"
}
```

**Fields**:
- **display_name**: Name shown in UI
- **ost_name**: OpenStack/Neutron network name

### 4. Hedgehog Kubeconfig

The `hedgehog_kubeconfig_b64` in the inventory allows the IaaS Console to interact with the Hedgehog Kubernetes cluster. It must be provided as a base64-encoded kubeconfig containing the public IP of the control node.

Steps to generate:

```sh
# Connect to the control node
ssh core@control-1.bcn

# Get the public IP of eth0 (used to access the cluster from IaaS)
IP=$(ip -4 addr show eth0 | grep inet | awk '{print $2}' | cut -d/ -f1)

# Generate base64-encoded kubeconfig with public IP
kubectl config view --flatten \
  | sed "s#server: https://127.0.0.1:6443#server: https://$IP:6443#" \
  | base64 -w0
```

### 5. Azure Single Sign-On

The IaaS Console supports Single Sign-On via Azure Active Directory. When configured, users can log in with their Azure AD accounts.

To enable it, obtain the required credentials by following the [Azure SSO Setup Guide](./AZURE_SSO_SETUP.md) and add them to your inventory:

```yaml
# inventory.yml
all:
  vars:
    iaas_console:
      azure_client_id: "6088c67f-45dd-4bca-b08c-c6fbcd26c40b"
      azure_tenant_id: "c36da824-36c5-4f3d-ae7c-a9e880782886"
      azure_redirect_uri: "https://console.phoenix-gpu.com/api/auth/azure/callback"
      azure_client_secret: !vault |
        $ANSIBLE_VAULT;1.1;AES256
        ...
```

**Variables:**
- `azure_client_id`: Application (client) ID from the Azure app registration
- `azure_tenant_id`: Directory (tenant) ID of your Azure AD tenant
- `azure_redirect_uri`: Must match the redirect URI registered in Azure, in the form `https://<console-hostname>/api/auth/azure/callback`
- `azure_client_secret`: Client secret generated in Azure — store vault-encrypted

Azure SSO is optional. If `azure_client_id` is not set (or left empty), the feature is disabled and the deployment is unaffected.

### 6. PostgreSQL Credentials (Disaster Recovery)

The `iaas-api` Helm chart generates random PostgreSQL credentials on first install. These survive normal Helm upgrades but are permanently lost if the cluster is destroyed or the Secret is deleted. Without the original credentials, existing S3 backups cannot be decrypted.

To preserve credentials across cluster recreations, extract them before destroying the cluster and add them vault-encrypted to `inventory.yml`:

```bash
# Run from inside the deployment container (./scripts/platform-setup.sh --shell)
kubectl get secret iaas-api-postgresql -n iaas-console -o jsonpath='{.data.password}' | base64 -d
kubectl get secret iaas-api-postgresql -n iaas-console -o jsonpath='{.data.postgres-password}' | base64 -d
kubectl get secret iaas-api-postgresql -n iaas-console -o jsonpath='{.data.replication-password}' | base64 -d
kubectl get secret iaas-api-postgresql -n iaas-console -o jsonpath='{.data.backup-key}' | base64 -d
```

```yaml
# inventory.yml
all:
  vars:
    iaas_console:
      postgresql_credentials:
        password: !vault |
          $ANSIBLE_VAULT;1.1;AES256
          ...
        postgres_password: !vault |
          $ANSIBLE_VAULT;1.1;AES256
          ...
        replication_password: !vault |
          $ANSIBLE_VAULT;1.1;AES256
          ...
        backup_key: !vault |
          $ANSIBLE_VAULT;1.1;AES256
          ...
```

On the next deployment, the original credentials will be restored and existing S3 backups will remain decryptable.

All four keys must be provided together — a partial configuration will cause the playbook to fail. When omitted, the chart generates random credentials as before.

## Console URL

The IaaS Console is served at:

```
https://console.<cluster_name>.<cluster_public_domain>
```

Both values come from the inventory:

- `cluster_name` — the short identifier for the deployment (e.g. `mycluster`)
- `cluster_public_domain` — the public domain registered for the environment (e.g. `example.com`)

TLS is enabled when `iaas_console_tls_enabled: true` is set in the inventory (the default scheme is `http` when omitted).

## Setup Workflow

1. Configure flavors and networks for tenant use
2. Add initial users to `operator_users` in the inventory
3. Configure `hedgehog_kubeconfig_b64` in the inventory
4. Provision IaaS Console (ansible playbook)
5. Operators log in and manage users via the [Operator API](./OPERATOR_API_GUIDE.md)
6. Users create VMs by selecting from available resources
