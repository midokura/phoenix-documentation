# IaaS Console Configuration

Configuration reference for the IaaS Console API Helm Chart.

This document explains the JSON configuration for the IaaS Console API Helm Chart.

## Configuration Sections

### 1. User Tenant Map

Defines user access and roles. Use this to bootstrap initial operators.

**Structure**:
```json
"user_email@example.com": {
  "tenant": "demo-project-tenant-A",
  "role": "operator|member"
}
```

**Fields**:
- **Email** (key): User's email address
- **tenant**: Tenant/project name
- **role**: Permission level
  - `operator`: Can manage users through the API
  - `member`: Standard user access

**Note**: After initial setup, operators can manage users via the API without editing this file.

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

### 3. Images

Defines available OS images for VMs.

**Structure**:
```json
{
  "display_name": "Human-readable name",
  "ost_name": "openstack-image-name"
}
```

**Fields**:
- **display_name**: Name shown in UI
- **ost_name**: OpenStack/Glance image name

### 4. Networks

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

### 5. Hedgehog Kubeconfig

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

## Setup Workflow

1. Configure flavors, images, and networks for tenant use
2. Edit `user_tenant_map` to add initial operators
3. Configure `hedgehog_kubeconfig_b64` in the inventory
4. Provision IaaS Console (ansible playbook)
5. Operators log in and manage users via the [Operator API](./OPERATOR_API_GUIDE.md)
6. Users create VMs by selecting from available resources
