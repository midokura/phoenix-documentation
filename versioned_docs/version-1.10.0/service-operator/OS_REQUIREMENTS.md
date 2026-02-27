# OS Requirements

Listing the OS requirements.

## Operating System
- Ubuntu Server 24.04 with HWE kernel

## Required Packages

- `ipmitool` - IPMI management
- `lm-sensors` - Hardware monitoring
- `smartmontools` - Disk health monitoring
- `bridge-utils` - Network bridge utilities
- `podman` - Container runtime
- `catatonit` - Container init
- `python3-podman` - Python Podman bindings
- `python3-pip` - Python package manager
- `libvirt-clients` - Virtualization tools
- `ovmf` - UEFI firmware for VMs
- `chrony` - NTP time synchronization

## Storage Configuration

### Disk Layout
- Two disks in RAID1 (mdraid) configuration
- GPT partition table on both disks
- EFI partitions on both disks (FAT32, ~256MB)
- Root filesystem on RAID1 array (ext4)
- Swap disabled
- UEFI boot from both disks

### Mount Points
- `/` - RAID1 root partition
- `/boot/efi` - Primary EFI partition
- `/boot/efi2` - Secondary EFI partition

## Network Configuration

- Netplan v2 configuration
- systemd-networkd with `--any` wait-online behavior

### Physical Interfaces
- VLAN trunk interface named to `physical0`

### VLAN Interfaces
- `frontend0` - VLAN 101 on `physical0` (default gateway)
- `provisioning0` - VLAN 102 on `physical0`

## Kernel Parameters

- `amd_iommu=on` - AMD IOMMU enabled
- `iommu=pt` - IOMMU passthrough mode
- Nouveau driver blacklisted

## Services

### SSH
- OpenSSH server installed
- Key-based authentication configured
- Root SSH access enabled

### NTP (Chrony)
- Custom NTP pool configuration
- pool.ntp.org as primary source

## System Configuration

- Root user enabled
- GRUB recordfail timeout: 3 seconds
- Docker directory pre-created (`/var/lib/docker`)
- open-iscsi removed
