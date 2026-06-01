# Bare Metal Management

Provisioning and managing bare metal servers

This guide explains how to provision and manage bare metal servers in the Console UI. Bare metal gives you direct, exclusive access to a physical server with no hypervisor overhead.

:::note

Before you can provision a bare metal server, an operator must first enroll the physical node and complete hardware inspection. See [Bare-Metal Node Enrollment](../service-operator/INSTALL_BAREMETAL_NODE.md) in the operator guide. A node must be in `available` state before it can be provisioned.

:::

---

## Provisioning a Bare Metal Server

Once a node is in `available` state, provision it by deploying an OS image. Provisioning typically takes 15–30 minutes.

1. Click **create server** in the **Servers** sidebar.
2. Select **Bare Metal** as the server type.
3. Fill in the form:

   | Field | Description |
   |---|---|
   | **Server Name** | A name for the provisioned server instance. |
   | **Flavor** | The hardware profile that matches the physical node's capabilities. |
   | **Image** | The OS image to deploy. |
   | **User Script** | An optional shell script that runs after first boot (cloud-init). |

4. Click **Provision Server**.

The server will appear in the **Servers** panel while provisioning.

:::note

Your registered SSH keys are automatically injected into the provisioned OS, so you can connect via SSH as soon as the server is active.

:::

---

## Connecting to a Bare Metal Server

Once the server status is **ACTIVE** in the **Servers** panel, connect using the IP address shown in the table:

```bash
ssh ubuntu@<server-ip-address>
```

The username may vary depending on the OS image used.

:::note

Bare metal servers are only accessible from the tenant VPN network. See [VPN Configuration](./VPN_CONFIGURATION) for setup instructions.

:::

---

## Deleting a Bare Metal Server

Deleting deprovisions the server and returns the physical node to the pool.

1. Locate the server in the **Servers** panel.
2. Click the **delete icon** on the row.
3. Confirm the deletion.

To remove the physical node enrollment entirely, delete it from the **Baremetal** panel after the server is deprovisioned.

:::note

A node cannot be deleted while a server is deployed on it. Delete the server first, then delete the node.

:::
