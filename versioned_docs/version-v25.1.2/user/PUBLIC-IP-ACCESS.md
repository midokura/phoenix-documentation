# Public IP Access

Setting up your public IP access

> **Prerequisites:**
> - Your IP is on the allowlist (contact your administrator)

## Overview

Public IP access allows you to reach your VMs and platform services without a VPN connection, provided your IP is on the allowlist.

## Your VMs

### Assigning a Floating IP

You can assign a floating IP to your VM in two ways:

1. During VM creation: toggle the option in the IaaS Console
2. After creation: attach a floating IP from the VM list

Once assigned, all TCP, UDP, and ICMP traffic is accessible on the floating IP from your allowed IP.

### Accessing Your VM

Use the floating IP as the connection target:

```bash
ssh -i ~/.ssh/your_key user@<floating-ip>
```

### Removing a Floating IP

You can detach a floating IP from the VM list in the IaaS Console at any time. The VM remains accessible via the private network through VPN.
