# SSH Key Registration

Setting up SSH key access to VMs in the IaaS console.

## Overview

To SSH into VMs, you need to have your SSH public key registered by the operator beforehand. Once registered, your SSH key will be injected into VMs created after the registration.

## Setup Process

1. Generate an SSH key pair
2. Share your SSH public key with the operator
3. Operator registers the public key
4. SSH into VMs created after registration

## Generate an SSH Key Pair

If you do not have an SSH key pair yet, generate one with the following command:

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

This creates two files:
- `~/.ssh/id_ed25519`: Your private key — keep this secret and secure
- `~/.ssh/id_ed25519.pub`: Your public key — share this with the operator

## Share Your Public Key with the Operator

Provide the contents of `~/.ssh/id_ed25519.pub` to the operator. The operator steps for registering the key are outlined [here](/docs/service-operator/OPERATOR_API_GUIDE.md).

## SSH into a VM

Once your SSH key has been registered, you can access VMs created after registration with:

```bash
ssh <username>@<vm-ip-address>
```
