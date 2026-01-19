# VPN Configuration for Tenant Users

Guide for setting up VPN access for tenant users.

This guide explains how to set up VPN access for users who have been assigned to a tenant.

## Overview

When a user is added to a tenant, the operator can generate a VPN configuration script for that user. The user then combines this script with their private key to create a complete VPN configuration.

## When to Generate VPN Configuration

VPN configuration can be generated after a user is associated with a tenant through either:

- **At tenant creation**: `POST /tenants`
- **Adding user to existing tenant**: `PUT /tenants/{tenant_id}/users/{user_id}`

## Operator: Fetch VPN Configuration Script

As an operator, retrieve the VPN configuration script for a user:

```bash
curl -H "Authorization: Bearer $JWT_TOKEN" \
     -H "Content-Type: application/json" \
     "${API_BASE_URL}/users/${USER_ID}/vpn" > vpn-config-script.sh
```

Provide this script to the user.

## User: Generate VPN Configuration

### Step 1: Generate Key Pair

The user must first generate their WireGuard private and public keys:

```bash
wg genkey > privatekey && wg pubkey < privatekey > pubkey
```

This creates two files:
- `privatekey`: Keep this secret
- `pubkey`: Share this with the operator if required

### Step 2: Generate VPN Configuration

Run the configuration script received from the operator, injecting your private key:

```bash
cat privatekey | bash vpn-config-script.sh > wg.conf
```

This creates `wg.conf` with your complete VPN configuration.

### Step 3: Import Configuration

Import the configuration into your system using the WireGuard UI or CLI. Example for the CLI:

```bash
sudo wg-quick up ./wg.conf
```
