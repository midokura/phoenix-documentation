# Router Services Configuration

The **Router Box** runs the foundational infrastructure services required before deploying OpenStack. It runs sequentially across four host groups:

| Play | Host Group | Service | Gate Variable |
|------|-----------|---------|---------------|
| Provision OpenWRT VM | `router_host` | Creates the router VM on KVM | `router_provisioning: true` |
| Configure OpenWRT | `openwrt_routers` | DHCP, DNS, TFTP, WireGuard, BGP | `router_provisioning: true` |
| Setup PXE Server | `openwrt_routers` | PXE boot and firmware files | `router_provisioning: true` |
| Initialize Environment | `kolla_bastion` | Docker registry for OpenStack images | Always runs |
| Deploy HedgeHog Controller | `hedgehog_host` | Fabric controller VM | Always runs |
| Provision HedgeHog Fabric | `hedgehog_control` | Switch and VPC configuration | Always runs |

All OpenWrt plays are gated behind `router_provisioning`. Set it to `true` in your inventory to enable router provisioning:

```yaml
router_host:
  vars:
    router_provisioning: true
```

To deploy a new change done in the inventory or during an upgrade, you need to run the phoenix platform-setup.sh installer: 
```bash
$ platform-setup.sh --bootstrap
```

---

## OpenWrt Router — DHCP Server

The router runs dnsmasq as a DHCP server, providing IP address assignment to infrastructure nodes. It supports per-interface pools with configurable ranges, static MAC-to-IP leases, and the ability to disable dynamic allocation on specific interfaces.

### Variables

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `openwrt_dhcp_poolshost` | list | See below | DHCP pools per network interface |
| `openwrt_dhcp_leases` | list | `[]` | Static DHCP reservations (MAC to IP) |

Each entry in `openwrt_dhcp_poolshost`:

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Pool identifier |
| `interface` | string | OpenWrt interface name to serve DHCP on |
| `start` | string | First address in the pool (host part only) |
| `end` | string | Last address in the pool (host part only) |
| `dynamicdhcp` | string | `"1"` to allow dynamic leases, `"0"` to only serve static leases |
| `force` | string | `"1"` to force DHCP even if another server is detected |
| `ignore` | string | `"1"` to disable DHCP on this interface entirely |

Each entry in `openwrt_dhcp_leases`:

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Hostname for the lease (used in DNS if `dns: "1"`) |
| `mac` | string | MAC address (e.g., `"88:e9:a4:02:37:96"`) |
| `ip` | string | IP address, optionally with CIDR (e.g., `"10.30.0.10"` or `"10.30.0.1/16"`) |
| `dns` | string | `"1"` to register a DNS entry for this host |

### Default DHCP Pools

The role provides these defaults. Override them in your inventory to match your network layout:

```yaml
openwrt_dhcp_poolshost:
  - name: "lan"
    interface: "lan"
    ignore: "1"            # DHCP disabled on LAN
  - name: "wan"
    interface: "wan"
    ignore: "1"            # DHCP disabled on WAN
  - name: "frontend"
    interface: "frontend"
    start: "100"
    end: "250"
    dynamicdhcp: "0"       # Only static leases
    force: "1"
```

### Example

```yaml
openwrt_routers:
  vars:
    openwrt_dhcp_poolshost:
      - name: "frontend"
        interface: "frontend"
        start: "100"
        end: "250"
        dynamicdhcp: "0"
        force: "1"
      - name: "provisioning"
        interface: "provisioning"
        start: "100"
        end: "250"
        dynamicdhcp: "1"
        force: "1"

    openwrt_dhcp_leases:
      # OpenStack control node
      - name: "control0"
        dns: "1"
        mac: "88:e9:a4:02:37:96"
        ip: "10.30.0.101"
      # Ceph storage nodes
      - name: "storage0"
        dns: "1"
        mac: "b8:ce:f6:7e:10:b2"
        ip: "10.30.0.63"
      - name: "storage1"
        dns: "1"
        mac: "B8:CE:F6:7E:11:CA"
        ip: "10.30.0.62"
      # Hedgehog controller
      - name: "hedgehog0"
        dns: "1"
        mac: "02:7f:3c:a9:4d:e2"
        ip: "192.168.33.249"
```

---

## OpenWrt Router — DNS Resolver

Dnsmasq also acts as the local DNS resolver. It provides a local domain for internal name resolution, static DNS A record overrides, and domain rebind exemptions for split-horizon DNS setups.

### Variables

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `openwrt_dhcp_dnsmasq_local` | string | — | Local domain prefix for DNS (e.g., `"/mydomain.com/"`) |
| `openwrt_dhcp_dnsmasq_domain` | string | — | Domain name assigned to DHCP clients (e.g., `"mydomain.com"`) |
| `openwrt_dhcp_dnsmasq_rebind_domain` | list | `[]` | Domains exempt from DNS rebind protection |
| `openwrt_dhcp_hostoverrides` | list | `[]` | Static DNS A record overrides |

Each entry in `openwrt_dhcp_hostoverrides`:

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Hostname to resolve (e.g., `"control0"`) |
| `ip` | string | IP address the hostname resolves to |

The `local` and `domain` variables work together: `local: "/mydomain.com/"` tells dnsmasq to answer queries for `mydomain.com` locally, and `domain: "mydomain.com"` assigns that domain to DHCP clients.

The `rebind_domain` list is needed when upstream DNS returns private IPs for certain domains (e.g., office VPN domains). Without this exemption, dnsmasq rejects these responses as potential DNS rebind attacks.

### Example

```yaml
openwrt_routers:
  vars:
    openwrt_dhcp_dnsmasq_local: "/mydomain.com/"
    openwrt_dhcp_dnsmasq_domain: "mydomain.com"
    openwrt_dhcp_dnsmasq_rebind_domain:
      - "mydomain.com"   # Allow office router queries resolving to private IPs

    openwrt_dhcp_hostoverrides:
      # OpenStack API VIP
      - name: "openstack-vip"
        ip: "10.30.0.222"
      # IaaS Console
      - name: "console"
        ip: "192.168.104.104"
      # Management services (resolved to K8s ingress IP)
      - name: "console.mydomain.com"
        ip: "192.168.104.23"
      - name: "grafana.mydomain.com"
        ip: "192.168.104.23"
```

---

## OpenWrt Router — TFTP/PXE Boot Server

The router serves as a PXE boot server for bare metal provisioning. Dnsmasq provides the TFTP service and tells PXE clients which boot file to load. Boot files (kernel, initrd, GRUB configs) are served from a shared filesystem mounted from the KVM host via 9P virtio.

### Variables

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `openwrt_dhcp_dnsmasq_enable_tftp` | string | `"1"` | Enable TFTP server in dnsmasq |
| `openwrt_dhcp_dnsmasq_tftp_root` | string | `"/tftp"` | Root directory for TFTP file serving |
| `openwrt_dhcp_dnsmasq_dhcp_boot` | string | `"bootx64.efi"` | Boot filename sent to PXE clients via DHCP option 67 |
| `openwrt_config.http_root` | string | `"/www/boot"` | HTTP server root for boot files (kernel, initrd, cloud-init) |
| `openwrt_config.tftp_root` | string | `"/tftp"` | TFTP root directory (symlinked to shared filesystem) |

### How It Works

1. A bare metal server sends a PXE DHCP request on the provisioning network
2. Dnsmasq responds with the router's IP as the TFTP server and `bootx64.efi` as the boot file
3. The server downloads the GRUB bootloader via TFTP
4. GRUB loads its per-MAC configuration, kernel, and initrd via HTTP from the router
5. The installer boots with cloud-init user-data served from the HTTP root

The `pxe_boot` role (which runs after `openwrt_configure` in the bootstrap playbook) populates the TFTP and HTTP directories with the actual boot files. The TFTP/PXE variables here control the dnsmasq side of the handshake.

### Example

The defaults work for most deployments. Override only if you need non-standard paths:

```yaml
openwrt_routers:
  vars:
    openwrt_dhcp_dnsmasq_enable_tftp: "1"
    openwrt_dhcp_dnsmasq_tftp_root: "/tftp"
    openwrt_dhcp_dnsmasq_dhcp_boot: "bootx64.efi"
    openwrt_config:
      http_root: "/www/boot"
      tftp_root: "/tftp"
```

---

## OpenWrt Router — WireGuard VPN

The router can terminate WireGuard VPN tunnels for site-to-site connectivity (e.g., to an upstream datacenter) and remote operator access. Configuration has two parts: defining the WireGuard interface and adding peers to it.

### WireGuard Interface

WireGuard interfaces are defined inside `openwrt_network_interfaceshost` alongside regular network interfaces. Set `proto: "wireguard"` to create a WireGuard interface.

| Field | Type | Description |
|-------|------|-------------|
| `proto` | string | Must be `"wireguard"` |
| `wg_managekeys` | boolean | `false` = keys stored in inventory (vault-encrypted) |
| `wg_listen_port` | integer | UDP port for incoming WireGuard connections |
| `wg_addresses` | list | IP addresses assigned to this interface (CIDR notation) |
| `wg_private_key` | string | Interface private key (must be vault-encrypted) |

### WireGuard Peers

Peers are defined in `openwrt_network_wireguardpeers`. This variable is a dictionary where each key is a peer name.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `interface` | string | Yes | WireGuard interface name this peer belongs to |
| `managekeys` | boolean | Yes | `false` = keys stored in inventory |
| `description` | string | No | Human-readable description |
| `allowed_ips` | list | Yes | CIDR blocks routed through this peer |
| `public_key` | string | Yes | Peer's WireGuard public key |
| `endpoint_host` | string | No | Peer's hostname or IP (omit for listen-only peers) |
| `endpoint_port` | integer | No | Peer's UDP port (required if `endpoint_host` is set) |
| `persistent_keepalive` | integer | No | Seconds between keepalive packets (use `25` for NAT traversal) |

Peers without `endpoint_host` are listen-only — the router waits for them to connect. This is typical for operator VPN clients.

This feature is conditional: it only activates when `openwrt_network_wireguardpeers` is defined in inventory.

---

## OpenWrt Router — Bird BGP Routing

The router can run Bird3 as a BGP daemon for dynamic routing. This is used to advertise public IP prefixes (floating IPs) to upstream routers and to receive host routes from OpenStack Neutron's dynamic routing agent.

This feature is conditional: it only activates when `bird_bgp_router_id` is defined in inventory.

### Variables

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `bird_bgp_router_id` | string | `"10.0.1.1"` | BGP router ID (must be unique in the BGP domain) |
| `bird_bgp_local_as` | integer | `65000` | Local BGP Autonomous System number |
| `bird_bgp_announced_prefixes` | list | `[]` | Network prefixes to advertise (CIDR notation) |
| `bird_bgp_direct_interfaces` | list | `[]` | Interfaces whose connected routes are imported into Bird |
| `bird_bgp_neighbors` | list | `[]` | BGP neighbor/peer definitions |

Each entry in `bird_bgp_neighbors`:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Neighbor identifier (used in Bird config as protocol name) |
| `ip` | string | Yes | Neighbor's IP address |
| `remote_as` | integer | Yes | Neighbor's AS number (same AS = iBGP, different = eBGP) |
| `import` | list | No | Import filter rules. Omit or set to `[]` to import none |
| `export` | list | No | Export filter rules. Omit or set to `[]` to export none |

Import/export filter rules are Bird filter expressions. Common patterns:

- `"net = 119.15.113.1/32"` — match a specific prefix
- `"net ~ [ 119.15.113.0/24{24,32} ]"` — match a prefix range
- `proto = "openstack_*"` — match routes learned from a specific protocol
- `ifname = "eth2.104"` — match routes on a specific interface

### Typical Topology

```
Upstream ISP (eBGP) <---> Edge Router (eBGP/iBGP) <---> OpenWrt Router (iBGP) <---> OpenStack Neutron DR Agent
```

The OpenWrt router sits between the edge router and OpenStack:
- It receives floating IP host routes from Neutron via iBGP
- It advertises the public subnet to the edge router
- The edge router peers with the upstream ISP

### Example

```yaml
openwrt_routers:
  hosts:
    router-0:
      bird_bgp_local_as: 65253
      bird_bgp_router_id: "10.30.0.1"
      bird_bgp_announced_prefixes:
        - "119.15.113.0/24"
      bird_bgp_direct_interfaces:
        - "eth2.104"       # External VLAN interface

      bird_bgp_neighbors:
        # iBGP to edge router via WireGuard tunnel
        - name: ty15_router0
          ip: "172.19.0.252"
          remote_as: 55393
          import:
            - "net = 119.15.113.1/32"
          export:
            - proto = "openstack_*"
            - ifname = "eth2.104"

        # iBGP to OpenStack Neutron (receives floating IP host routes)
        - name: openstack_control0
          ip: "10.30.0.101"
          remote_as: 65253
          import:
            - "net ~ [ 119.15.113.0/24{24,32} ]"
          export: []
```

---

## Deployment Host

The deployment host (inventory group `kolla_bastion`) is the machine from which OpenStack is installed and managed. The bootstrap playbook sets up a local Docker registry on this host so that OpenStack container images can be served locally, enabling air-gapped deployments and faster image pulls across the cluster.

This play always runs (no gate variable).

### Inventory Group

The `kolla_bastion` group defines connection credentials for the deployment host:

```yaml
kolla_bastion:
  vars:
    ansible_user: ubuntu
    ansible_password: !vault |
      $ANSIBLE_VAULT;1.1;AES256
      ...encrypted...
    ansible_become_password: !vault |
      $ANSIBLE_VAULT;1.1;AES256
      ...encrypted...
    ansible_ssh_private_key_file: "~/.ssh/mido_infra.pem"
  hosts:
    192.168.33.250: {}
```

### Docker Registry Variables

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `registry_image` | string | `docker.io/library/registry` | Container image for the registry |
| `registry_image_tag` | string | `"2"` | Registry image tag |
| `registry_port` | integer | `5000` | Port the registry listens on |
| `registry_data_dir` | string | `/var/lib/registry` | Persistent storage directory |
| `registry_configure_insecure` | boolean | `true` | Register as insecure in Podman's `registries.conf` |
| `registry_populate_images` | boolean | `false` | Automatically populate registry with OpenStack images |
| `registry_source_registry` | string | `ghcr.io` | Source registry to pull images from |
| `registry_source_namespace` | string | `midokura/openstack.kolla` | Source namespace |
| `registry_image_tag_kolla` | string | `2025.1-ubuntu-noble` | Kolla image tag to mirror |
| `registry_image_list` | list | 91 images | List of image names to populate |
| `registry_image_list_file` | string | `""` | Path to a file with image names (overrides `registry_image_list`) |
| `registry_dest_namespace` | string | `openstack.kolla/` | Namespace in the local registry |
| `registry_populate_parallel` | integer | `5` | Number of concurrent image copy operations |
| `registry_source_auth` | dict | `{}` | Credentials for the source registry (`{username: "", password: ""}`) |

When `registry_populate_images: true`, the role uses `skopeo` to copy all images from the source registry into the local registry. This is useful for air-gapped environments or to avoid rate limits.

### Example

Minimal configuration (registry with defaults, no image population):

```yaml
kolla_bastion:
  vars:
    ansible_user: ubuntu
    ansible_password: !vault |
      $ANSIBLE_VAULT;1.1;AES256
      ...encrypted...
    ansible_become_password: !vault |
      $ANSIBLE_VAULT;1.1;AES256
      ...encrypted...
  hosts:
    192.168.33.250: {}
```

With image population from GHCR:

```yaml
kolla_bastion:
  vars:
    ansible_user: ubuntu
    ansible_password: !vault |
      $ANSIBLE_VAULT;1.1;AES256
      ...encrypted...
    ansible_become_password: !vault |
      $ANSIBLE_VAULT;1.1;AES256
      ...encrypted...
    registry_populate_images: true
    registry_source_auth:
      username: "github-user"
      password: "ghp_xxxxxxxxxxxx"
  hosts:
    192.168.33.250: {}
```

---

## Hedgehog Controller VM

The Hedgehog controller manages the network fabric (switches, VLANs, VPCs). The bootstrap playbook provisions it as a KVM virtual machine on the `hedgehog_host` with PCI passthrough for the management NIC that connects to the physical switches.

This play always runs on the `hedgehog_host` group.

### Variables

The role uses the merge pattern: defaults are defined in `hedgehog_defaults` and you override specific fields via the `hedgehog` dictionary in inventory. Unspecified fields keep their defaults.

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `hedgehog.vm_name` | string | `hedgehog-controller` | Libvirt VM name |
| `hedgehog.ram_mb` | integer | `16384` | RAM in megabytes (16 GB) |
| `hedgehog.vcpu` | integer | `8` | Number of virtual CPUs |
| `hedgehog.disk_gb` | integer | `40` | Disk size in gigabytes |
| `hedgehog.iso_url` | string | (built-in URL) | URL to the Hedgehog installer ISO |
| `hedgehog.iso_checksum` | string | (built-in checksum) | SHA256 checksum for ISO verification |
| `hedgehog.iso_dir` | string | `/var/lib/libvirt/images/isos` | Directory to cache the downloaded ISO |
| `hedgehog.autostart` | boolean | `true` | Auto-start VM on host reboot |
| `hedgehog.bridge_name` | string | `virbr-libvirt` | Host bridge for upstream VM connectivity |
| `hedgehog.vm_mac` | string | `02:7f:3c:a9:4d:e2` | MAC address of the VM's bridge interface |
| `hedgehog.mgmt_nic_pci` | string | `pci_0000_01_00_1` | PCI address of the NIC to pass through for switch management |

The `mgmt_nic_pci` is the most important variable to override: it must point to a physical NIC on the host that is cabled to the management switch where the fabric switches are connected. Use the `pci_XXXX_XX_XX_X` format (underscores instead of colons/dots).

The `iso_url` must point to a signed URL (e.g., Azure Blob Storage SAS URL) for the Hedgehog installer image. The built-in default may expire — check the expiration date and update as needed.

### Provisioning Process

1. The ISO is downloaded to `iso_dir` and verified against `iso_checksum`
2. A VM is created with UEFI boot, the specified resources, and a CDROM attached to the ISO
3. The management NIC is passed through to the VM via PCI hostdev
4. The VM boots the installer, which runs unattended
5. After installation completes, the role waits for the Kubernetes API inside the VM to become ready (up to ~100 minutes)

### Example

In most cases you only need to override `iso_url` and `mgmt_nic_pci`:

```yaml
hedgehog_host:
  hosts:
    bastion0:
      hedgehog:
        iso_url: "https://storage.example.com/hedgehog-installer.iso?token=xxx"
        mgmt_nic_pci: "pci_0000_58_00_0"
```

Full override example:

```yaml
hedgehog_host:
  hosts:
    bastion0:
      hedgehog:
        vm_name: hedgehog-controller
        ram_mb: 32768
        vcpu: 16
        disk_gb: 80
        iso_url: "https://storage.example.com/hedgehog-installer.iso?token=xxx"
        iso_checksum: "sha256:d88bf389cbbb255f4f189709861b55c391dde5e1173da3c4c5c6d2ac8c954a48"
        mgmt_nic_pci: "pci_0000_58_00_0"
        bridge_name: "virbr-libvirt"
        vm_mac: "02:7f:3c:a9:4d:e2"
        autostart: true
```
