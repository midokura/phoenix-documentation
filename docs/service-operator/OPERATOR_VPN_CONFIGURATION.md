# Operator VPN: Adding operators to the WireGuard configuration

Granting a new user access to the operator WireGuard VPN.

## Prerequisites

- The deployment container image is built and available locally
- Access to the environment's inventory file

## Step 1: Add the peer

```bash
./platform-setup.sh --add-wg-peer "John Doe"
```

The command generates a WireGuard keypair, assigns the next available IP,
updates the inventory, and saves a client configuration file to
`<assets-dir>/wg-confs/john_doe.conf`.

## Step 2: Send the client configuration

Share the generated `.conf` file with the user. They can import it into:
- **macOS/Windows/iOS/Android**: WireGuard app -> Import from file
- **Linux**: `wg-quick up ./john_doe.conf`

> **Important**: The `.conf` file contains the user's private key.
> Send it via a secure channel (for example, encrypted message, not plain email).

## Step 3: Deploy to the router

```bash
./platform-setup.sh --bootstrap --tags wireguard
```

## Troubleshooting

### "Peer already exists"

A peer with the same name already exists. Check the inventory for the
existing entry. If the user needs a new keypair, remove the old entry
first and re-run the command.

### "No available IPs in range"

All operator IP slots are used. Review existing peers and remove any
that are no longer needed.