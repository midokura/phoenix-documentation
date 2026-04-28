---
sidebar_position: 4
---

# Key Rotation Overview

This document is the entry point for all AI Factory key rotation procedures. It describes which key types exist, their rotation schedule, and which rotations require downtime. The runbooks for those procedures are linked below.

For the full key management policy (lifecycle, approval workflow, audit trail), see [Key Management Policy](../KEY_MANAGEMENT_POLICY).

## Key Inventory

| Key Type | Scope | Rotation Period | Downtime? |
|---|---|---|---|
| **SSH keys** (`mido_infra`) | Infrastructure access (all hosts, both environments) | Every 6 months (aligned with release cycle) | No |
| **TLS certificates** | HAProxy, RabbitMQ, Octavia CA, backend services | 1 year | Brief (service restart) |
| **WireGuard VPN keys** | Operator VPN peer keys | 1 year | Brief (VPN reconnect) |
| **Ansible Vault passwords** | Secrets encryption at rest (per environment) | 1 year | No |

## Key Rotation Runbooks

- [Rotate SSH Keys](./key-rotation/SSH_KEYS)
- [Rotate Ansible Vault Passwords](./key-rotation/ANSIBLE_VAULT)
- [Rotate Openstack TLS certificates](./key-rotation/TLS_CERTIFICATES)
- [Rotate WireGuard VPN Keys](./key-rotation/VPN_WIREGUARD_KEYS)
