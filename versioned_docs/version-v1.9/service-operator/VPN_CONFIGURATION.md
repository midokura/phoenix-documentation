# VPN Configuration for Tenant Users

Setting up the VPN for Tenant Users.

This guide explains how a service operator should set up VPN access for users who have been assigned to a tenant.

For help with setting up and configuring WireGuard, refer to the [WireGuard Quick Start guide](https://www.wireguard.com/quickstart/).

## Overview

When a user is added to a tenant, the operator can generate a VPN configuration script for that user. The user then combines this script with their private key to create a complete VPN configuration. This page explains the service operator steps, the user steps of this process are outlined [here](/docs/user/VPN_CONFIGURATION).

## Setup Process

Once the user has generated a WireGuard key pair and has shared the public key with the service operator, the VPN setup follows these steps:

1. Operator adds user to tenant with the public key
2. Operator fetches and provides VPN configuration script to the user

## Add User to Tenant

After receiving the user's public key, add the user to a tenant. The user's WireGuard public key must be provided in the `pubkey` field for VPN access configuration.

For complete API details and examples, see the [Add User to Tenant](OPERATOR_API_GUIDE.md#add-user-to-tenant) section in the Operator API Guide.

## Fetch and provide VPN Configuration Script

Retrieve the VPN configuration script for the user:

```bash
curl -H "Authorization: Bearer $JWT_TOKEN" \
     -H "Content-Type: application/json" \
     "${API_BASE_URL}/users/${USER_ID}/vpn" > vpn-config-script.sh
```

Provide this script to the user.
