# Server BIOS and BMC Setup

Required BIOS and BMC settings for all servers in the AI Factory cluster. Complete these before installing the operating system.

## BMC configuration

Common to all servers — run through the BMC web interface.

Configuration › Account Services — create the following users:

| User name | Password | Network privilege | Account types |
|-----------|----------|-------------------|---------------|
| `operator` | unique per machine | Operator | Redfish/IPMI |
| `metrics` | observability password | User | Redfish/IPMI; SNMP (Auth: HMAC-MD5, Auth Key: observability password, Encryption: None) |

Configuration › Notifications › SNMP:

| Setting | Value |
|---------|-------|
| Enable SNMP | On |
| SNMPv3 | On |
| Auth | HMAC_MD5 |
| Encryption | None |

Configuration › Network › Port:

| Setting | Value |
|---------|-------|
| SNMP Port | On |

Configuration › BMC Settings:

| Setting | Value |
|---------|-------|
| Host Interface | Off |

:::note

Host Interface can only be set from the OS or EFI shell — setting it from the BIOS throws an error. Setting it to Off restricts OS-level IPMI access so that unprivileged OS users cannot add or change accounts or upgrade firmware (equivalent to KCS Control: Operator).

:::

## Secure Boot key enrollment

Common to all server models; only required when Secure Boot is not in factory-default state, for example, after a firmware reset or key clear.

1. In BIOS, navigate to **Security › Secure Boot**, set CSM Support to **Disabled**, then open **Key Management** and perform the following sequence:
   - **Factory Key Provision**: Enabled → Install factory defaults: Yes → Reset without saving: No
   - **Factory Key Provision**: Disabled — select Disabled again to toggle it off after the factory restore
   - **Reset To Setup Mode**: Yes → Reset without saving: No
   - Esc, then Save Changes and Reset
2. From an Arch Linux machine, install and copy [`sbctl`](https://wiki.archlinux.org/title/Unified_Extensible_Firmware_Interface/Secure_Boot#sbctl) to the target host:
   ```bash
   sudo pacman -S sbctl
   scp /usr/bin/sbctl root@<host>:/usr/local/bin/
   ```
3. On the target host, confirm Setup Mode is active:
   ```bash
   sbctl status
   # Installed:   ✓ sbctl is installed
   # Setup Mode:  ✗ Enabled
   # Secure Boot: ✗ Disabled
   # Vendor Keys: none
   ```
4. Enroll keys and reboot:
   ```bash
   sbctl create-keys   # skip if keys already exist at /usr/share/secureboot
   sbctl enroll-keys -m
   reboot
   ```
5. In BIOS: **Security › Secure Boot › Enter Deployed Mode**, set Secure Boot to **Enabled**, then Save and Reset.
6. Verify enrollment:
   ```bash
   sbctl status
   # Installed:   ✓ sbctl is installed
   # Setup Mode:  ✓ Disabled
   # Secure Boot: ✓ Enabled
   # Vendor Keys: microsoft
   mokutil --pk | grep Issuer  # must not show "DO NOT TRUST - AMI Test PK"
   ```

:::note

After enabling Secure Boot, the nVidia GRID host driver must be reinstalled (rebuilt). The build generates a Machine-Owned Key (MOK) that must be enrolled on the next reboot via the "Perform MOK management" menu. To re-enroll an existing MOK without rebuilding the driver:
```bash
mokutil --import /var/lib/shim-signed/mok/MOK.der
# On reboot: Enroll MOK → Continue → Yes → <MOK password> → Reboot
# Verify:
mokutil --list-enrolled | grep Issuer
```

:::

## BIOS settings

### SuperMicro 5019

| BIOS path | Setting | Value |
|-----------|---------|-------|
| Advanced › Boot Feature | Wait For "F1" If Error | Disabled |
| Advanced › NB Configuration | IOMMU | Enabled |
| Advanced › PCIe/PCI/PnP Configuration | SR-IOV Support | Enabled |
| Advanced › PCIe/PCI/PnP Configuration | PCIe ROM types | EFI (all) |
| Advanced › PCIe/PCI/PnP Configuration | Network Stack | Enabled |
| Advanced › PCIe/PCI/PnP Configuration › Network Stack Configuration | IPv4 PXE Support | Enabled |
| Advanced › PCIe/PCI/PnP Configuration › Network Stack Configuration | IPv6 PXE Support | Disabled |
| Advanced › PCIe/PCI/PnP Configuration › Network Stack Configuration | HTTP Support (all options) | Disabled |
| Security › Secure Boot | CSM Support | Disabled |
| Boot | Boot mode select | UEFI |

:::tip

Save and reset after the PCIe/PCI/PnP changes before continuing to the Secure Boot and Boot settings — some firmware versions require a reboot for the Network Stack sub-menu to appear.

:::

Boot priority: #1 UEFI Hard Disk, #2 UEFI Network, #3 UEFI Built-in EFI Shell, #4–#9 Disabled. Under **UEFI Network Drive BBS Priorities**, disable all entries except the first.

### SuperMicro 1115 and 4125

| BIOS path | Setting | Value |
|-----------|---------|-------|
| Advanced › Boot Feature | Wait For "F1" If Error | Disabled |
| Advanced › NB Configuration | IOMMU | Enabled |
| Advanced › NB Configuration | Power Profile Selection | Efficiency Mode |
| Advanced › PCIe/PCI/PnP Configuration | Above 4G Decoding | Enabled |
| Advanced › PCIe/PCI/PnP Configuration | Re-Size BAR Support | Enabled (required if GPUs are installed) |
| Advanced › PCIe/PCI/PnP Configuration | SR-IOV Support | Enabled |
| Advanced › Network Configuration | IPv6 PXE Support | Disabled |
| Advanced › Network Configuration › 1st NIC › IPv4 Network Configuration | Configured | Enabled |
| Advanced › Network Configuration › 1st NIC › IPv4 Network Configuration | Enable DHCP | Enabled |
| Security › Secure Boot | CSM Support | Disabled |

Boot priority and UEFI Network Drive BBS Priorities: same as 5019 above.

### SuperMicro AS-8126GS-NB3RT

GPU hypervisor servers.

| BIOS path | Setting | Value |
|-----------|---------|-------|
| Advanced › Boot Feature | Wait For "F1" If Error | Disabled |
| Advanced › CPU Configuration | Workload Profile | Virtualization (Hypervisors) |
| Advanced › NB Configuration | IOMMU | Enabled |
| Advanced › NB Configuration | DMAr Support | Enabled |
| Advanced › NB Configuration | Power Profile Selection | Auto (High-performance mode) |
| Advanced › PCIe/PCI/PnP Configuration | Above 4G Decoding | Enabled |
| Advanced › PCIe/PCI/PnP Configuration | Re-Size BAR Support | Enabled (required if GPUs installed) |
| Advanced › PCIe/PCI/PnP Configuration | SR-IOV Support | Enabled |
| Advanced › Network Configuration | IPv6 PXE Support | Disabled |

For each Nvidia BlueField NIC port, under **Advanced › Nvidia Network Adapter**:

| Path | Setting | Value |
|------|---------|-------|
| NIC Configuration | Legacy Boot Protocol | None |
| Device Level Configuration | Virtualization Mode | None |
| Device Level Configuration | PXE Boot Filters | Enabled |
| BlueField Internal CPU Configuration | Internal CPU Offload Engine | Disabled (1st port only) |
| (top level) | Network Link Type | Ethernet |

:::note

Virtualization Mode: None enables SR-IOV with 8 virtual functions per port. Internal CPU Offload Engine must be Disabled on the 1st port only.

:::

For GPU servers — create the OS boot RAID array before first boot via **Advanced › BROADCOM SAS 3808N Configuration Utility › Configure › Create Virtual Drive**:
- RAID Level: RAID1
- Media Type: SSD, Interface Type: NVMe
- Select drives C0:01:00 and C1:01:01 → Apply Changes
- Save Configuration: Confirm Enabled → Yes → OK

Boot priority and UEFI Network Drive BBS Priorities: same as 5019 above.
