# VM Management

Creating and managing virtual machines

This guide explains how to create and manage virtual machines (VMs) in the Console UI.

## Navigation

Click **Servers** in the left sidebar to open the servers management page. VMs are listed alongside any bare metal servers you have provisioned.

---

## Prerequisites

Before creating a VM, ensure:

- Your SSH key is registered with your tenant. See [SSH Key Registration](./SSH_KEY_REGISTRATION).
- You are connected to the tenant VPN. See [VPN Configuration](./VPN_CONFIGURATION).

---

## Creating a VM

1. Click **create server** (top-right of the servers panel).
2. Select **Virtual Machine** as the server type.
3. Fill in the form:

   | Field | Description |
   |---|---|
   | **Name** | A name for the VM. |
   | **Flavor** | The hardware configuration (CPU, RAM, GPU, and storage). |
   | **VM image** | The operating system image to boot. |
   | **Network** | The network to attach the VM to. Defaults to the VPN network when left blank. |
   | **Auto-assign floating IP** | Attach a public IP automatically at creation time (optional). |

4. Click **Create**. The VM appears in the table while provisioning. It may take a few minutes to start up.

---

## Listing Servers and Quota

The **Servers** page shows all running VMs and bare metal servers. The quota bar at the top shows current usage for instances, vCPUs, RAM, and GPUs.

---

## Floating IPs

A floating IP is a publicly routable IP that makes a VM accessible from outside the tenant VPN.

### Attaching a Floating IP

1. Locate the VM in the servers table.
2. Click the **Attach floating IP** button on the row.
3. Confirm in the dialog.

The floating IP address appears in the VM row once attached.

### Detaching a Floating IP

1. Locate the VM in the servers table.
2. Click the **Detach floating IP** button on the row.
3. Confirm in the dialog.

The IP stays allocated to your tenant and can be reattached to the same or a different VM later.

---

## Connecting via SSH

Once the VM is running, connect using the IP address shown in the servers table:

```bash
ssh <username>@<vm-ip-address>
```

The default username depends on the image used. For example, Ubuntu images use `ubuntu`.

:::note

VMs are only accessible from the tenant VPN network. Ensure your VPN connection is active before connecting. See [VPN Configuration](./VPN_CONFIGURATION) for setup instructions.

:::

---

## Deleting a VM

1. Click the **delete icon** on the VM row.
2. Confirm the deletion in the dialog.

The VM and its associated SSH key are removed. This action is irreversible.

:::note

Infrastructure servers (VPN gateway nodes and Kubernetes cluster nodes) cannot be deleted from this panel.

:::
