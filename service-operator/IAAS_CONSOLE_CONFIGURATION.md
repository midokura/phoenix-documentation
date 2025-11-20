# IaaS Console Configuration

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

## Setup Workflow

1. Configure flavors, images, and networks for tenant use
2. Edit `user_tenant_map` to add initial operators
3. Operators log in and manage users via the [Operator API](./OPERATOR_API_GUIDE.md)
4. Users create VMs by selecting from available resources
