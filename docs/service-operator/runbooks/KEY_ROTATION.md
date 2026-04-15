# Key Rotation — Overview

Overview of all AI Factory cryptographic key and credential rotation procedures.

This document is the entry point for all AI Factory key rotation procedures. It describes which key types exist, their rotation schedule, and which rotations require downtime.

## Key Inventory

| Key Type | Scope | Rotation Period | Downtime? |
|---|---|---|---|
| **SSH keys** (`mido_infra`) | Infrastructure access (all hosts, both environments) | Every 6 months (aligned with release cycle) | No |
| **TLS certificates** | HAProxy, RabbitMQ, Octavia CA, backend services | 1 year | Brief (service restart) |
| **WireGuard VPN keys** | Operator VPN peer keys | 1 year | Brief (VPN reconnect) |
| **Ansible Vault passwords** | Secrets encryption at rest (per environment) | 1 year | No |

## Rotation Schedule

Key rotation is aligned with the AI Factory release cycle (every 6 months). The table below shows what must be rotated at each interval:

| Interval | Keys to rotate |
|---|---|
| Every release (~6 months) | SSH keys |
| Annually (every 2nd release) | TLS certificates, WireGuard VPN keys, Ansible Vault passwords |

## Downtime Matrix

| Key Type | Downtime? | Notes |
|---|---|---|
| SSH keys | **No downtime** | Zero-downtime rotation: new key is added before old key is removed |
| TLS certificates | **Brief service restart** | HAProxy and RabbitMQ require restart; schedule a maintenance window |
| WireGuard VPN keys | **Brief VPN disconnect** | Each peer must reconnect after key update; ~1 minute per peer |
| Ansible Vault passwords | **No downtime** | Files are re-encrypted offline; no running services are affected |
