# Bare Metal Management

Enrolling, provisioning, and managing bare metal servers

This guide explains how to enroll physical nodes and provision bare metal servers in the Console UI. Bare metal gives you direct, exclusive access to a physical server with no hypervisor overhead.

The workflow has two stages:

1. **Enrollment** (Baremetal panel): Register the physical node and run hardware inspection once, so the platform knows its capabilities.
2. **Provisioning** (Servers panel): Deploy an OS image onto an available node to create a running server.

---

## Enrolling a Node

Enrollment registers a new physical server with the platform using its IPMI (Intelligent Platform Management Interface) credentials. This is a one-time setup step per physical node.

### From the UI

1. Click **Baremetal** in the left sidebar.
2. Click **enroll BM** (top-right of the panel).
3. Fill in the form:

   | Field | Description |
   |---|---|
   | **Node Name** | A name for the node (for example, `gpu-node-01`). |
   | **IPMI Address** | The IP address of the node's BMC (for example, `192.168.1.100`). |
   | **IPMI Port** | The IPMI port (default: `623`). |
   | **IPMI Username** | The BMC login username. |
   | **IPMI Password** | The BMC login password. |
   | **MAC Address** | The MAC address of the PXE-boot network interface (format: `AA:BB:CC:DD:EE:FF`). |
   | **Automatically inspect hardware after enrollment** | Runs hardware inspection immediately after enrollment (recommended). |

4. Click **Enroll Node**.

### Via API

```bash
export JWT_TOKEN="<your-token>"
export API_BASE_URL="https://<iaas-api-host>"

curl -X POST \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "gpu-node-01",
    "ipmi_address": "192.168.1.100",
    "ipmi_port": 623,
    "ipmi_username": "admin",
    "ipmi_password": "secret",
    "mac_address": "AA:BB:CC:DD:EE:FF"
  }' \
  "${API_BASE_URL}/api/bms"
```

Response: the UUID of the newly enrolled node.

---

## Hardware Inspection

Inspection boots the node with a lightweight ramdisk that collects detailed hardware information: CPU, memory, disks, network interfaces, and boot configuration. This populates the hardware inventory and makes the node schedulable.

Inspection discovers:

- CPU model, core count, and architecture
- Total memory
- Disk configuration (device names, capacity, and type)
- Network interfaces (MAC addresses, speed, and link status)
- Boot configuration (BIOS/UEFI mode)

### From the UI

On the **Baremetal** page, select the node and click **Inspect** in the node status panel. Inspection can be re-triggered from the same panel if it previously failed.

### Via API

Inspection requires the node to be in `enroll` or `manageable` state. The API handles the state transition automatically:

```bash
curl -X POST \
  -H "Authorization: Bearer $JWT_TOKEN" \
  "${API_BASE_URL}/api/bms/<bm-id>/actions/inspect"
```

To move a node to `manageable` state manually:

```bash
curl -X POST \
  -H "Authorization: Bearer $JWT_TOKEN" \
  "${API_BASE_URL}/api/bms/<bm-id>/actions/manage"
```

---

## Making a Node Available for Provisioning

After inspection completes, the node must be moved to `available` state before it can be provisioned.

### From the UI

On the **Baremetal** page, select the node and click **Provide** in the node status panel.

### Via API

```bash
curl -X POST \
  -H "Authorization: Bearer $JWT_TOKEN" \
  "${API_BASE_URL}/api/bms/<bm-id>/actions/provide"
```

---

## Node Lifecycle

Nodes progress through the following states before they are ready for provisioning:

```
enroll → manageable → inspecting → available → active
```

| State | Description |
|---|---|
| `enroll` | Newly registered; no hardware information yet. |
| `manageable` | Platform has authenticated to the BMC; ready for inspection. |
| `inspecting` | Hardware inspection in progress. |
| `available` | Inspection complete; ready to be provisioned. |
| `active` | OS deployed; server is running. |

---

## Listing Nodes

### From the UI

Click **Baremetal** in the left sidebar to see all enrolled nodes, their provision state, power state, maintenance status, and discovered hardware.

Click the details icon on any row to view full hardware inventory, IPMI configuration, and boot information.

### Via API

```bash
# List all nodes
curl -H "Authorization: Bearer $JWT_TOKEN" "${API_BASE_URL}/api/bms"

# Get a specific node
curl -H "Authorization: Bearer $JWT_TOKEN" "${API_BASE_URL}/api/bms/<bm-id>"

# Include hardware inventory
curl -H "Authorization: Bearer $JWT_TOKEN" "${API_BASE_URL}/api/bms/<bm-id>?include_inventory=true"
```

---

## Provisioning a Bare Metal Server

Once a node is in `available` state, provision it by deploying an OS image. Provisioning typically takes 15–30 minutes.

### From the UI

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

### Via API

The provision endpoint uses a multipart form:

```bash
curl -X POST \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -F "name=my-bm-server" \
  -F "flavor_id=<flavor-id>" \
  -F "image_id=<image-id>" \
  "${API_BASE_URL}/api/bms/provision"
```

To include a user script that runs at first boot:

```bash
curl -X POST \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -F "name=my-bm-server" \
  -F "flavor_id=<flavor-id>" \
  -F "image_id=<image-id>" \
  -F "user_script=@/path/to/setup.sh" \
  "${API_BASE_URL}/api/bms/provision"
```

Response: the server ID of the provisioned instance.

:::note

Your registered SSH keys are automatically injected into the provisioned OS, so you can connect via SSH as soon as the server is active.

:::

---

## Connecting to a Bare Metal Server

Once the server status is **ACTIVE** in the **Servers** panel, connect using the IP address shown in the table:

```bash
ssh <username>@<server-ip-address>
```

The default username depends on the OS image used.

:::note

Bare metal servers are only accessible from the tenant VPN network. See [VPN Configuration](./VPN_CONFIGURATION) for setup instructions.

:::

---

## Deleting a Bare Metal Server

Deleting deprovisions the server and returns the physical node to the pool.

### From the UI

1. Locate the server in the **Servers** panel.
2. Click the **delete icon** on the row.
3. Confirm the deletion.

To remove the physical node enrollment entirely, delete it from the **Baremetal** panel after the server is deprovisioned.

### Via API

```bash
# Delete the provisioned server instance
curl -X DELETE \
  -H "Authorization: Bearer $JWT_TOKEN" \
  "${API_BASE_URL}/api/servers/<server-id>"

# Delete the node enrollment (removes the node from the platform entirely)
curl -X DELETE \
  -H "Authorization: Bearer $JWT_TOKEN" \
  "${API_BASE_URL}/api/bms/<bm-id>"
```

:::note

A node cannot be deleted while a server is deployed on it. Delete the server first, then delete the node.

:::
