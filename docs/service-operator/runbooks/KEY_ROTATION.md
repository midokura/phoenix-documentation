# Key Rotation Overview

Rotating cryptographic keys and credentials.

This document is the entry point for all AI Factory key rotation procedures. It describes which key types exist, their rotation schedule, and which rotations require downtime. The runbooks for those procedures are in the [Key Rotation Runbooks](./key-rotation/) section.

## Key Inventory

| Key Type | Scope | Rotation Period | Downtime? |
|---|---|---|---|
| **SSH keys** (`mido_infra`) | Infrastructure access (all hosts, both environments) | Every 6 months (aligned with release cycle) | No |
| **TLS certificates** | HAProxy, RabbitMQ, Octavia CA, backend services | 1 year | Brief (service restart) |
| **WireGuard VPN keys** | Operator VPN peer keys | 1 year | Brief (VPN reconnect) |
| **Ansible Vault passwords** | Secrets encryption at rest (per environment) | 1 year | No |


## Downtime Matrix

| Key Type | Downtime? | Notes |
|---|---|---|
| SSH keys | **No downtime** | Zero-downtime rotation: new key is added before old key is removed |
| TLS certificates | **Brief service restart** | HAProxy and RabbitMQ require restart; schedule a maintenance window |
| WireGuard VPN keys | **Brief VPN disconnect** | Each peer must reconnect after key update; ~1 minute per peer |
| Ansible Vault passwords | **No downtime** | Files are re-encrypted offline; no running services are affected |
