---
sidebar_position: 16
---

# Network Fabric Configuration

Defining the physical connections operators must configure in the HedgeHog network fabric.

> **Note:** The AI Factory uses the [HedgeHog Open Network
> Fabric](https://docs.hedgehog.cloud/latest/user-guide/overview/) for its
> switching layer. This guide documents the AI Factory conventions on top of it;
> for the underlying fabric concepts and resource reference, see the public
> HedgeHog documentation at
> <https://docs.hedgehog.cloud/latest/user-guide/overview/>.

The fabric is described declaratively in the environment inventory. Before any
VPC or workload can use the network, an operator must describe how every server
and switch is physically cabled. This guide covers what you are
expected to configure:

- **[Switch configuration](#switch-configuration)** — registering each switch and
  its [redundancy group](#redundancy-groups).
- **Server connections** — how a server attaches to the fabric:
  - [Unbundled](#unbundled-server-connection) — server on a single switch port
  - [Bundled](#bundled-server-connection) — server LAG to a single switch
  - [ESLAG](#eslag-server-connection) — server multi-homed across 2–4 switches
- **Switch connections** — how switches link to each other:
  - [Fabric](#fabric-switch-connection) — spine ↔ leaf underlay uplinks
  - [Mesh](#mesh-switch-connection) — direct leaf ↔ leaf links

The [appendix](#appendix-switch-ip--asn-convention) documents the switch
IP/ASN addressing convention this repo follows.

> **Where these go:** All connections are declared in the environment inventory
> file (for example, `ansible/inventories/<environment>/inventory.yml`) and
> applied by the `hedgehog` Ansible role. Each connection becomes a HedgeHog
> `Connection` custom resource on the control node. The physical cabling on the
> rack must match exactly what you declare here.

## Before You Start

### Prerequisites Checklist

- [ ] **Switches registered** — every switch must be defined under
      `hedgehog_switches` (see [Switch Configuration](#switch-configuration))
      before any connection can reference it.
- [ ] **Servers registered** — every `server` you reference below must already be
      defined in `hedgehog_servers`.
- [ ] **Physical wiring map** — know which server NIC connects to which switch
      port for every link.
- [ ] **Port naming** — server ports use the OS interface name (for example
      `ens2f0np0`, `eth0`); switch ports use the HedgeHog port name (for example
      `E1/1`). You can find more information on naming convention [here](https://docs.hedgehog.cloud/latest/user-guide/profiles/#port-naming).

### How a Connection Is Named

Every connection has a `name` that becomes the HedgeHog resource name. Names
must be unique across the whole fabric. The convention used in existing
environments is `<server>--<zone>` for server connections and
`<switchA>--<switchB>` for switch connections, for example
`gpu0--frontend` or `frontend-leaf0--frontend-spine0`.

---

## Switch Configuration

Before any connection can reference a switch, the switch itself must be
registered under `hedgehog_switches`. Each entry becomes a HedgeHog `Switch`
custom resource and tells the fabric the switch's identity (ASN, loopbacks),
hardware profile, role in the topology, and — for redundant leaves — which
[redundancy group](#redundancy-groups) it belongs to.

`hedgehog_switches` is a **dictionary** keyed by an arbitrary local key. The
`name` field is what is actually applied and what connections reference.

```yaml
hedgehog_switches:
  frontend_leaf0:
    name: "frontend-leaf0"
    profile: "dell-s5232f-on"
    description: "frontend-leaf0--dell-s5232f-on"
    # Switch ID 20 (frontend server-leaf, range 20-49). See appendix.
    ip: "172.30.0.20/21"
    protocol_ip: "172.30.8.20/32"
    vtep_ip: "172.30.12.20/32"
    role: "server-leaf"
    asn: 65110
    boot:
      mac: "b0:4f:13:7f:1d:a0"
    ecmp:
      roce_qpn: false
    enable_all_ports: false
    roce: false
    vlan_namespaces:
      - "operator"
      - "tenant"
    redundancy:
      group: frontend-redundancy-0
      type: eslag
```

**Fields**

| Field | Required | Description |
|---|---|---|
| `name` | yes | Unique switch name (becomes the `Switch` resource name); referenced by all connections. |
| `profile` | yes | Hardware/SONiC profile for the switch model (for example `dell-s5232f-on`). |
| `description` | yes | convention is `<name>--<profile>`. |
| `ip` | yes | Management IP of the switch, with prefix (for example `172.30.0.20/21`). See the [appendix](#appendix-switch-ip--asn-convention). |
| `protocol_ip` | yes | BGP protocol loopback, `/32` (for example `172.30.8.20/32`). |
| `vtep_ip` | for leaves | VXLAN tunnel endpoint loopback, `/32`. Required on leaves that terminate the overlay; omit on switches that do not. |
| `role` | yes | Topology role: `spine` or `server-leaf`. |
| `asn` | yes | BGP ASN for the switch (private range, derived from the switch ID — see appendix). |
| `boot.mac` | yes | MAC address of the switch's management/boot port; used by the fabric to identify the switch during ONIE/SONiC install. |
| `ecmp.roce_qpn` | no | Enable RoCE QPN-based ECMP hashing. Set `false` unless RoCE is in use. |
| `enable_all_ports` | no | When `true`, brings up every port; normally `false` so only declared ports come up. |
| `roce` | no | Enable RoCE (RDMA over Converged Ethernet) on the switch. `false` unless required. |
| `vlan_namespaces` | yes | List of VLAN namespaces this switch participates in (must exist in `hedgehog_vlan_namespaces`). |
| `redundancy` | no | Redundancy group membership — see [Redundancy Groups](#redundancy-groups). Set to `{}` (or omit) for a standalone switch. |
| `port_breakouts` | no | Optional map of port → breakout mode (for example splitting a 100G port into 4×25G). |
| `port_speeds` | no | Optional map of port → fixed speed override. |

### Redundancy Groups

A **redundancy group** ties together the switches that jointly serve a
multi-homed server, so the fabric knows they form one logical redundancy domain.
It is the switch-side counterpart of an [ESLAG server
connection](#eslag-server-connection): the server bonds its links across several
switches, and those switches must share a redundancy group of type `eslag` so
that EVPN multi-homing (ESI-LAG) is programmed consistently across them.

```yaml
hedgehog_switches:
  frontend_leaf0:
    [...]
    redundancy:
  group: frontend-redundancy-0
  type: eslag
```

| Field | Required | Description |
|---|---|---|
| `group` | yes (within `redundancy`) | Name of the redundancy group. **All switches that share a group must use the exact same name.** This name is also declared as a `SwitchGroup` under `hedgehog_switch_groups`. |
| `type` | yes (within `redundancy`) | Redundancy mechanism. Use `eslag` (EVPN multi-homing) for new deployments. |

**When to use it**

- Set `redundancy` on **every leaf that participates in an ESLAG** for a given
  server. For example, if servers multi-home across `frontend-leaf0` and
  `frontend-leaf1`, both switches carry
  `redundancy: { group: frontend-redundancy-0, type: eslag }`.
- Leave it as `redundancy: {}` (or omit it) for switches that are **not** part of
  any multi-homing domain — for example back-end leaves that only host unbundled
  (single-homed) connections.

**Declare the matching switch group**

Each redundancy group name must also exist as an entry in
`hedgehog_switch_groups` so the fabric creates the corresponding `SwitchGroup`
resource:

```yaml
hedgehog_switch_groups:
  frontend_redundancy0:
    name: "frontend-redundancy-0"
    spec: {}
```

> **Consistency rule:** The `redundancy.group` value on the member switches, and
> the `name` of the `hedgehog_switch_groups` entry, must match exactly. A
> mismatch means the switches will not be recognized as a single redundancy
> domain and ESLAG connections across them will not converge.

---

## Server Connections

These describe how a compute, storage, GPU, or control server attaches to the
fabric. Choose **unbundled** when the server reaches the fabric through a single
port or link redundancy is not a requirement (e.g. backend connections);
**bundled** when the server runs a LAG (LACP bond) to a *single* switch; and
**ESLAG** when the server is multi-homed across two or more switches for
redundancy (e.g. frontend connections).

| Connection | Server side | Switches | Redundancy |
| --- | --- | --- | --- |
| [Unbundled](#unbundled-server-connection) | single port, no bond | 1 | none |
| [Bundled](#bundled-server-connection) | LACP bond (LAG) | 1 | link-level (no switch redundancy) |
| [ESLAG](#eslag-server-connection) | LACP bond (LAG) | 2–4 | link- and switch-level |

### Unbundled Server Connection

**Purpose / when to use it**

Use an unbundled connection when a server is cabled to a **single switch on a
single port**, with no bonding (no LACP, no multi-homing). This is the simplest
connection type. Recommended for the backend NIC that is PCI-passed-through to
the VM, and hence, does not need redundancy.

If the server needs redundancy across two switches to support switch failover scenarios, use
[ESLAG](#eslag-server-connection) instead.

**Configuration**

Declared under `hedgehog_unbundled_connections` as a dictionary keyed by an
arbitrary local key (the key is for your own readability; the `name` field is
what is applied):

```yaml
hedgehog_unbundled_connections:
  gpu0_port0__backend_leaf0:
    name: "gpu0-port0--backend-leaf0"
    server: "gpu0"
    server_interface: "ens1"
    switch: "backend-leaf0"
    switch_port: "E1/17"
```

**Fields**

| Field | Required | Description |
|---|---|---|
| `name` | yes | Unique name of the connection (becomes the `Connection` resource name). Convention is `<server>--<zone>` for eslag connections, `<server>--<switch> for bundled connections, and `<server>--<switch_port>` for unbundled connections. |
| `server` | yes | Name of the server, as registered in `hedgehog_servers`. |
| `server_interface` | yes | The server's OS interface name for this link (for example `ens1`, `eth0`). |
| `switch` | yes | Name of the switch, as registered in `hedgehog_switches`. |
| `switch_port` | yes | The switch port the server is cabled to (for example `E1/17`). |

---

### Bundled Server Connection

**Purpose / when to use it**

Use a bundled connection when a server runs an **802.3ad LACP bond (LAG) to a
single switch** — that is, two or more links to the *same* switch combined into
one port-channel. This increases bandwidth and survives the loss of an
individual cable, but it does **not** protect against the switch failing (all
links land on one switch).

Choose this over [unbundled](#unbundled-server-connection) when the server needs
a multi-link LAG, and over [ESLAG](#eslag-server-connection) when there is only a
single switch available (no switch-level redundancy required). If you need to
survive a switch failure, use [ESLAG](#eslag-server-connection) instead.

**Configuration**

Declared under `hedgehog_bundled_connections` as a dictionary keyed by an
arbitrary local key. Each connection has a list of `links` — one per member of
the bond, all pointing at the same switch:

```yaml
hedgehog_bundled_connections:
  control0__leaf0:
    name: "control0--leaf0"
    fallback: true
    links:
      - server: "control0"
        server_port: "ens1f0"
        switch: "leaf0"
        switch_port: "E1/1"
      - server: "control0"
        server_port: "ens1f1"
        switch: "leaf0"
        switch_port: "E1/2"
```

**Fields**

| Field | Required | Description |
| --- | --- | --- |
| `name` | yes | Unique name of the connection (becomes the `Connection` resource name). |
| `fallback` | no (default `true`) | When `true`, the port-channel forwards traffic before LACP negotiation completes. Required for PXE boot, since iPXE does not speak LACP. Leave at the default unless you have a specific reason to disable it. |
| `links` | yes | List of links — one per bond member. All links must reference the **same** `switch`. |
| `links[].server` | yes | Server name, as registered in `hedgehog_servers`. |
| `links[].server_port` | yes | The server's OS interface name for this bond member. |
| `links[].switch` | yes | Switch name for this link — the **same** switch for every link in the bond. |
| `links[].switch_port` | yes | The switch port this bond member is cabled to. |

> **Note:** All links in a bundled connection must land on the **same** switch.
> If the links span two or more switches, it is an
> [ESLAG](#eslag-server-connection), not a bundled, connection.

---

### ESLAG Server Connection

**Purpose / when to use it**

Use an ESLAG (EVPN Single-Link Aggregation / ESI multi-homing) connection when a
server is **multi-homed across 2–4 switches** and you want active-active
redundancy. The server runs a single LACP bond whose member links land on
different switches; the fabric uses EVPN multi-homing so that any switch in the
set can carry the traffic. If a switch or link fails, the bond keeps forwarding
over the remaining links.

This is the **preferred** redundant server connection type for new deployments.
It is recommended for frontend links for control, compute, storage and GPU hypervisors.

**Configuration**

Declared under `hedgehog_eslag_connections` as a dictionary keyed by an arbitrary
local key. Each connection has a list of `links`, one per switch the server
attaches to:

```yaml
hedgehog_eslag_connections:
  control0__frontend:
    name: "control0--frontend"
    fallback: true
    links:
      - server: "control0"
        server_port: "ens2f0np0"
        switch: "frontend-leaf0"
        switch_port: "E1/1"
      - server: "control0"
        server_port: "ens2f1np1"
        switch: "frontend-leaf1"
        switch_port: "E1/1"
```

**Fields**

| Field | Required | Description |
|---|---|---|
| `name` | yes | Unique name of the connection. |
| `fallback` | no (default `true`) | When `true`, the bond forwards traffic before LACP negotiation completes. Required for PXE boot, since iPXE does not speak LACP. Leave at the default unless you have a specific reason to disable it. |
| `links` | yes | List of links, **2 to 4 entries**, one per switch the server is multi-homed to. |
| `links[].server` | yes | Server name, as registered in `hedgehog_servers`. |
| `links[].server_port` | yes | The server's OS interface name for this member link. |
| `links[].switch` | yes | Switch name for this member link, as registered in `hedgehog_switches`. |
| `links[].switch_port` | yes | The switch port this member link is cabled to. |

> **Note:** Each link should land on a **different** switch. Two links across two
> switches is the most common layout; up to four switches are supported.

---

## Switch Connections

These describe how the switches themselves are interconnected. They build the
underlay that carries tenant traffic between leaves. Use **fabric** connections
for the standard spine-leaf topology, and **mesh** connections only when leaves
are cabled directly to each other.

### Fabric Switch Connection

**Purpose / when to use it**

Use a fabric connection to define the **spine ↔ leaf uplinks** of a standard
spine-leaf (CLOS) topology. Each leaf connects up to one or more spines; these
links form the routed underlay over which the EVPN/VXLAN overlay runs. Configure
one fabric connection per spine-leaf pair, listing every physical cable between
them.

Each end of every link gets a point-to-point IP address (a `/31` per cable is
the convention), because the underlay is routed, not switched.

**Configuration**

Declared under `hedgehog_fabric_connections` as a **list**. Each entry is one
spine-leaf pair, with a list of `links` (one per cable):

```yaml
hedgehog_fabric_connections:
  - name: "frontend-leaf0--spine0"
    links:
      # leaf0 <-> spine0
      - leaf:
          ip: "172.30.128.0/31"
          switch: "frontend-leaf0"
          port: "E1/29"
        spine:
          ip: "172.30.128.1/31"
          switch: "frontend-spine0"
          port: "E1/1"
      - leaf:
          ip: "172.30.128.2/31"
          switch: "frontend-leaf0"
          port: "E1/30"
        spine:
          ip: "172.30.128.3/31"
          switch: "frontend-spine0"
          port: "E1/2"
```

**Fields**

| Field | Required | Description |
|---|---|---|
| `name` | yes | Unique name of the connection (one per spine-leaf pair). Convention is <switchA>--<switchB>|
| `links` | yes | List of links — one entry per physical cable between this spine and leaf. |
| `links[].leaf.ip` | yes | Point-to-point IP for the leaf end of the link (typically a `/31`). |
| `links[].leaf.switch` | yes | Name of the leaf switch. |
| `links[].leaf.port` | yes | Leaf switch port for this cable. |
| `links[].spine.ip` | yes | Point-to-point IP for the spine end of the link. Must be the paired address of the leaf IP (the two addresses of the `/31`). |
| `links[].spine.switch` | yes | Name of the spine switch. |
| `links[].spine.port` | yes | Spine switch port for this cable. |

> **IP addressing:** The `leaf.ip` and `spine.ip` on a single link must be the
> two usable addresses of the same `/31` (for example `172.30.128.0/31` →
> `.0` and `.1`). Do not reuse a `/31` across links.

---

### Mesh Switch Connection

**Purpose / when to use it**

Use a mesh connection to cable **two leaf switches directly to each other**,
without going through a spine. This is used where a small back-end fabric does
not have (or does not need) a spine layer, or to provide an east-west path
between two leaves. Like fabric links, mesh links are routed and carry
point-to-point IP addresses on each end.

> **When *not* to use it:** In a standard spine-leaf topology, leaves should
> reach each other **through the spine** using [fabric](#fabric-switch-connection)
> connections. Only use mesh where two leaves are physically cross-connected.

**Configuration**

Declared under `hedgehog_mesh_connections` as a **list**. Each entry connects a
pair of leaves, with a list of `links` (one per cable). Note that the two ends
of each link are keyed `leaf1` and `leaf2`:

```yaml
hedgehog_mesh_connections:
  - name: "backend-mesh"
    links:
      # backend-leaf0 <-> backend-leaf1
      - leaf1:
          ip: "172.30.192.0/31"
          switch: "backend-leaf0"
          port: "E1/31"
        leaf2:
          ip: "172.30.192.1/31"
          switch: "backend-leaf1"
          port: "E1/31"
      - leaf1:
          ip: "172.30.192.2/31"
          switch: "backend-leaf0"
          port: "E1/32"
        leaf2:
          ip: "172.30.192.3/31"
          switch: "backend-leaf1"
          port: "E1/32"
```

**Fields**

| Field | Required | Description |
|---|---|---|
| `name` | yes | Unique name of the connection (one per leaf pair). |
| `links` | yes | List of links — one entry per physical cable between the two leaves. |
| `links[].leaf1.ip` | yes | Point-to-point IP for the first leaf's end of the link (typically a `/31`). |
| `links[].leaf1.switch` | yes | Name of the first leaf switch. |
| `links[].leaf1.port` | yes | Port on the first leaf for this cable. |
| `links[].leaf2.ip` | yes | Point-to-point IP for the second leaf's end. Must be the paired address of `leaf1.ip` (the two addresses of the `/31`). |
| `links[].leaf2.switch` | yes | Name of the second leaf switch. |
| `links[].leaf2.port` | yes | Port on the second leaf for this cable. |

---

## Troubleshooting

### A connection references an unknown server or switch

Confirm the `server` / `switch` values exactly match names defined in
`hedgehog_servers` and `hedgehog_switches`. The names are case-sensitive.

### Duplicate connection name

Connection names must be unique fabric-wide. If two entries share a `name`, the
second overwrites the first. Check both the server and switch connection blocks.

### Server bond not coming up / PXE fails over ESLAG

Ensure `fallback: true` is set (it is the default) on ESLAG connections used for
PXE boot — iPXE cannot negotiate LACP, so without fallback the port stays down
until the OS bond comes up.

### Underlay link down on a fabric or mesh connection

Verify the two IPs on the link are the two addresses of the same `/31` and that
the cabling matches the declared ports. Mismatched subnets or swapped ports are
the most common cause. Confirm the addresses follow the
[switch IP/ASN convention](#appendix-switch-ip--asn-convention).

### ESLAG not converging across a switch pair

Check that every leaf in the pair carries the **same** `redundancy.group` name
with `type: eslag`, and that a matching `hedgehog_switch_groups` entry exists
with the identical `name`. A typo in the group name means the switches are not
treated as one redundancy domain. See [Redundancy Groups](#redundancy-groups).

## References

- [Network Control Node Setup](NETWORK_CONTROL_NODE_SETUP.md) — provisioning the
  control node and installing SONiC before configuring the fabric.
- HedgeHog Connections documentation: https://docs.hedgehog.cloud/25.04/user-guide/connections/
- HedgeHog Switches and Servers: https://docs.hedgehog.cloud/25.04/user-guide/switches-and-servers/

---

## Appendix: Switch IP & ASN Convention

This appendix documents the addressing convention this repository follows for
fabric switches (`hedgehog_switches`) and their P2P links
(`hedgehog_fabric_connections`, `hedgehog_mesh_connections`). The goal is to let
the fabric **grow without renumbering existing switches**: a new switch always
takes the next free ID in its zone, and its loopbacks, management IP, ASN, and
link IPs are all derivable from that ID.

The convention covers **two zones — `frontend` and `backend`**. Each environment
uses one fabric supernet (`172.30.0.0/16` in BCN; other environments may pick a
different `/16` but follow the same internal layout).

### Fabric supernet layout

Reserve a single `/16` per environment, carved into purpose-specific blocks:

| Block             | Purpose                                          |
|-------------------|--------------------------------------------------|
| `172.30.4.0/22`   | Management (`switch.ip`), gateway `.1`           |
| `172.30.8.0/22`   | Protocol loopbacks (`switch.protocol_ip`, `/32`) |
| `172.30.12.0/22`  | VTEP loopbacks (`switch.vtep_ip`, `/32`)         |
| `172.30.128.0/18` | Fabric P2P links (spine ↔ leaf), `/31` per link  |
| `172.30.192.0/18` | Mesh P2P links (leaf ↔ leaf), `/31` per link     |

Block boundaries are aligned on `/22` and `/18`, giving headroom for hundreds of
switches and thousands of P2P links.

### Switch ID — the single source of truth

Every switch is assigned a permanent two-digit **switch ID** from a per-zone,
per-role range. Once assigned, an ID is **never reused or reshuffled**.

| Zone     | Role        | Switch ID range | ASN range   |
|----------|-------------|-----------------|-------------|
| frontend | spine       | 10–19           | 65100–65109 |
| frontend | server-leaf | 20–49           | 65110–65139 |
| backend  | spine       | 50–59           | 65150–65159 |
| backend  | server-leaf | 60–99           | 65160–65199 |

For a switch with ID `N`:

- `ip:          172.30.0.N/21`
- `protocol_ip: 172.30.8.N/32`
- `vtep_ip:     172.30.12.N/32`
- `asn:         65100 + (N − 10)`

The ASN formula yields the table above without gaps; each switch gets a unique
valid private ASN.

### P2P link allocation

P2P links use a `/31` per link (RFC 3021), allocated **per switch pair** inside a
per-zone `/24` so that adding a link to an existing pair (or a brand-new pair)
never disturbs existing addresses. The rule for which end gets which address is:
**the lower-ID switch gets the lower IP** of each `/31`.

**Fabric (spine ↔ leaf)** — per-zone `/24` inside `172.30.128.0/18`:

| Zone     | Block             |
|----------|-------------------|
| frontend | `172.30.128.0/24` |
| backend  | `172.30.129.0/24` |

Each `(leaf, spine)` pair gets a fixed `/28` (16 IPs = 8 `/31` links — enough
ECMP headroom), indexed inside the `/24` as:

```

with `spine_base = 10`, `leaf_base = 20` (frontend) or `60` (backend). Because
every leaf ID is `≥ leaf_base` and every spine ID is `≥ spine_base` within a
zone, `row` is always `≥ 0`; a negative `row` would mean a switch ID outside
its zone/role range, which is invalid (see the switch ID table above).

Example (frontend, spine0=10, leaf0=20, leaf1=21):

| Pair                   | `row` calculation              | `pair_block` calculation                     | `/28`               | Link 1 (leaf/spine) | Link 2 (leaf/spine) |
| ---------------------- | ------------------------------- | ---------------------------------------------- | -------------------- | -------------------- | -------------------- |
| leaf0(20) ↔ spine0(10) | `(20−20)*10 + (10−10)` = `0`   | `172.30.128.0` + `0*16` = `172.30.128.0`      | `172.30.128.0/28`   | `.0` / `.1`         | `.2` / `.3`         |
| leaf1(21) ↔ spine0(10) | `(21−20)*10 + (10−10)` = `10`  | `172.30.128.0` + `10*16` = `172.30.128.160`   | `172.30.128.160/28` | `.160` / `.161`     | `.162` / `.163`     |

Within the `/28`, `/31` links are consumed in order (first link `.0`/`.1`,
second link `.2`/`.3`, and so on), with the lower-ID switch (here, the leaf)
always taking the lower address of the pair.

**Mesh (leaf ↔ leaf, no spine)** — per-zone `/24` inside `172.30.192.0/18`:

| Zone     | Block             |
|----------|-------------------|
| frontend | `172.30.192.0/24` |
| backend  | `172.30.193.0/24` |

Each leaf pair gets a fixed `/28`, indexed inside the `/24` by ascending leaf
ID order — the first leaf pair in the zone (by lowest IDs) gets the first
`/28`, the next pair gets the next `/28`, and so on:

```text
pair_block = zone_block + (pair_index * 16)
```

where `pair_index` is the 0-based position of the `(leaf_a, leaf_b)` pair when
all mesh-connected pairs in the zone are sorted by `(leaf_a_id, leaf_b_id)`.

Example (backend, leaf0=60, leaf1=61 — the first and only mesh pair in the
zone, so `pair_index = 0`):

| Pair                  | `pair_block` calculation                  | `/28`             | Link 1 (low/high) | Link 2 (low/high) |
|-----------------------|---------------------------------------------|-------------------|--------------------|--------------------|
| leaf0(60) ↔ leaf1(61) | `172.30.192.0` + `0*16` = `172.30.192.0`   | `172.30.192.0/28` | `.0` / `.1`        | `.2` / `.3`        |


### Adding a new switch

# IMPORTANT: **Do not touch any existing switch's addresses.**
1. Pick the next unused ID inside the zone/role range above.
2. Set `ip`, `protocol_ip`, `vtep_ip`, and `asn` from the formulas.
3. For each fabric link, compute the pair `/28` using the row formula and consume
   the next free `/31` inside it; assign the lower IP to the lower-ID switch.
4. For each mesh link, allocate the next free `/28` in the zone's mesh `/24`.

> This convention mirrors the canonical reference in the infrastructure repo
> (`docs/015-switch-ip-convention.md`); keep the two in sync if the scheme
> changes.
