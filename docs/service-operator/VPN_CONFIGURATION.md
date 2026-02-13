# VPN Configuration for Tenant Users

Setting up the VPN for Tenant Users.

This guide explains how to set up VPN access for users who have been assigned to a tenant.

## Overview

When a user is added to a tenant, the operator can generate a VPN configuration script for that user. The user then combines this script with their private key to create a complete VPN configuration.

## Setup Process

The VPN setup follows these steps:

1. User generates WireGuard key pair
2. User shares public key with operator
3. Operator adds user to tenant with the public key
4. Operator fetches and provides VPN configuration script
5. User combines script with private key to create final VPN configuration

## User: Generate Key Pair

First, generate your WireGuard private and public keys:

```bash
wg genkey > privatekey && wg pubkey < privatekey > pubkey
```

This creates two files:
- `privatekey`: Keep this secret and secure
- `pubkey`: Share this with the operator

View your public key:

```bash
cat pubkey
```

Provide this public key to the operator so they can add you to the tenant.

## Operator: Add User to Tenant

After receiving the user's public key, add the user to a tenant. The user's WireGuard public key must be provided in the `pubkey` field for VPN access configuration.

For complete API details and examples, see the [Add User to Tenant](OPERATOR_API_GUIDE.md#add-user-to-tenant) section in the Operator API Guide.

## Operator: Fetch VPN Configuration Script

Retrieve the VPN configuration script for the user:

```bash
curl -H "Authorization: Bearer $JWT_TOKEN" \
     -H "Content-Type: application/json" \
     "${API_BASE_URL}/users/${USER_ID}/vpn" > vpn-config-script.sh
```

Provide this script to the user.

## User: Generate VPN Configuration

### Step 1: Combine Script with Private Key

Run the configuration script received from the operator, injecting your private key:

```bash
cat privatekey | bash vpn-config-script.sh > wg.conf
```

This creates `wg.conf` with your complete VPN configuration.

### Step 2: Import Configuration

Import the configuration into your system using the WireGuard UI or CLI. Example for the CLI:

```bash
sudo wg-quick up ./wg.conf
```

## Additional Resources

For detailed information on WireGuard client setup and configuration options, refer to the [official WireGuard Quick Start guide](https://www.wireguard.com/quickstart/).
