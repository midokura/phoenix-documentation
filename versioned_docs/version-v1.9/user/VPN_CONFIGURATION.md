# VPN Configuration for Tenant Users

Setting up the VPN for Tenant Users.

This guide explains how a user should set up VPN access when they have been assigned to a tenant.

For help with setting up and configuring WireGuard, refer to the [WireGuard Quick Start guide](https://www.wireguard.com/quickstart/).

## Overview

When a user is added to a tenant, the operator can generate a VPN configuration script for that user. The user then combines this script with their private key to create a complete VPN configuration. This page explains the user steps, the service operator steps of this process are outlined [here](/docs/service-operator/VPN_CONFIGURATION).


## Setup Process

The VPN setup follows these steps:

1. User generates WireGuard key pair
2. User shares public key with operator
3. User receives the configuration script and combines it with the private key to create final VPN configuration

## Generate Key Pair

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

## Share public key with operator

Provide this public key to the operator so they can add you to the tenant.

## Generate VPN Configuration

Once you receive the script from the service operator, follow these two steps:

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
