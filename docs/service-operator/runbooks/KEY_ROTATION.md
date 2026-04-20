# Key Rotation Overview

<<<<<<< docs/ansible-key-rotation-runbook
Rotating cryptographic keys and credentials.

=======
>>>>>>> main
This document is the entry point for all AI Factory key rotation procedures. It describes which key types exist, their rotation schedule, and which rotations require downtime. The runbooks for those procedures are in the [Key Rotation Runbooks](./key-rotation/) section.

## Key Inventory

| Key Type | Scope | Rotation Period | Downtime? |
|---|---|---|---|
| **SSH keys** (`mido_infra`) | Infrastructure access (all hosts, both environments) | Every 6 months (aligned with release cycle) | No |
| **TLS certificates** | HAProxy, RabbitMQ, Octavia CA, backend services | 1 year | Brief (service restart) |
| **WireGuard VPN keys** | Operator VPN peer keys | 1 year | Brief (VPN reconnect) |
| **Ansible Vault passwords** | Secrets encryption at rest (per environment) | 1 year | No |

<<<<<<< docs/ansible-key-rotation-runbook
## Key Rotation Runbooks

- [Rotate SSH Keys](./key-rotation/SSH_KEYS.md)
- [Rotate Ansible Vault Passwords](./key-rotation/ANSIBLE_VAULT.md)
=======
:::note

Runbooks for TLS certificates, WireGuard VPN keys, and Ansible Vault password rotation are not yet published.

:::
>>>>>>> main

