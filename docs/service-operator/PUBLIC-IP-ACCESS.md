# Public IP Access

Setting up the public IP access

## Overview

Public IP access allows users on the allowlist to reach platform services and VMs through public IPs without a VPN connection.

All public traffic flows through floating IPs from the BGP public subnet. The router announces the subnet via BGP, so traffic routes directly to the floating IP without DNAT.

## FIP Pools

The BGP public subnet is divided into two pools:

| Pool | Purpose | OpenStack Allocation |
|---|---|---|
| shared_services_pool | Manually assigned FIPs | No, reserved outside the allocation pool |
| tenant1_fip_pool | Tenant VM FIPs | Yes, set as the subnet allocation pool |

### Inventory Configuration

```yaml
bgp:
  public_subnet:
    cidr: "119.15.113.0/24"
    shared_services_pool: "119.15.113.16/29"
    tenant1_fip_pool: "119.15.113.96/27"
    allocation_pool:
      start: "119.15.113.96"
      end: "119.15.113.127"
```

## IP Allowlisting

### Structure

```
ansible/inventories/<env>/
  iplists/
    operators    # Internal staff
    tenants      # Customer IPs (one CIDR per line)
```

### Pushing Allowlists

Ansible pushes these files to `/etc/config/iplists` on the router. The `openwrt_configure` role renders firewall rules from inventory data.

### Firewall Rules

The `wan` zone default policy is DROP. Two ip sets reference the allowlist files:

- Operators reach the full BGP public subnet (all VMs and services)
- Tenants reach only the tenant FIP pool (VMs) and the shared services pool (IaaS Console, Grafana)

See [Router Box Setup](./ROUTER_BOX_SETUP.md) for firewall configuration details.

## VM Floating IP Assignment

Users can assign a FIP to a VM in two ways:

1. During VM creation: a toggle in the IaaS Console UI
2. After creation: attach or detach a FIP from the VM list

All TCP, UDP, and ICMP traffic is allowed on the floating IP.
