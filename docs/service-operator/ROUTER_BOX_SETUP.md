# Router Box Setup

Setting up the router box.

The router box hosts several VMs required for bootstrapping the Phoenix system:
- **OpenWRT VM** - Routing
- **Deployment VM** - Runs the Phoenix installer and serves as a bastion host
- **Hedgehog VM** - Network fabric management

This document will guide you through all the necessary steps to have a functional router box.

## BIOS Configuration

### BIOS Update
Update to v1.27 or higher if at a lower version.

### Enable AMT (Intel Active Management Technology)
1. Access BIOS setup screen
2. Enter MEBx
3. Enable by setting a complex password with special charaters, capital letters and numbers (default `admin:admin`)
4. Access AMT Network Setup and set to a static IP that belongs to the BMC IP subnet.

### Security Settings
- **Secure Boot**: Disabled during BIOS update and OS install phases, Enabled post-install
- Rest of defaults are ok

## USB Drive Preparation

Prepare 2 USB drives:

### USB 1: Ubuntu Server ISO
Download Ubuntu 24.04.3 Server:
```
https://ftp.rediris.es/sites/releases.ubuntu.com/24.04/ubuntu-24.04.3-live-server-amd64.iso
```

Make sure no partitions are mounted and flash the image to USB 1 with:
```bash
sudo dd if=/path/to/ubuntu-24.04.3-live-server-amd64.iso of=/dev/sdX bs=4M status=progress conv=fsync
```

**Note**: replace X with the actual drive letter (a, b, c ...), e.g. /dev/sdb. You can use `lsblk | grep sd` to see the available USB sticks connected.

### USB 2: Cloud-Init CIDATA Drive

#### user-data file

Create a `user-data` file similar to the following (adjust values as needed):

```yaml
autoinstall:
  version: 1
  early-commands:
    - 'printf "letmein\nletmein" | sudo passwd ubuntu-server'
  locale: en_GB.UTF-8
  keyboard:
    layout: en
  user-data:
    timezone: Asia/Tokyo
    disable_root: false
  network:
    version: 2
    ethernets:
      # A working network at install time is required when
      #   - refresh-installer.update==true
      #   - updates==all
      #   - Any packages specified in the packages section
      #   - Any commands that needs network in late-commands section
      # ┌───────────────────────────────────────────────────────────────┐
      # │                ROUTER BOX - REAR PANEL                        │
      # │                                                               │
      # │   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐          │
      # │   │  SFP+   │  │  SFP+   │  │  RJ45   │  │  RJ45   │          │
      # │   │         │  │         │  │  ┌───┐  │  │  ┌───┐  │          │
      # │   │  ░░░░░  │  │  ░░░░░  │  │  │   │  │  │  │   │  │          │
      # │   │  ░░░░░  │  │  ░░░░░  │  │  └───┘  │  │  └───┘  │          │
      # │   └─────────┘  └─────────┘  └─────────┘  └─────────┘          │
      # │   enp2s0f0np1  enp2s0f0np0    enp89s0     enp87s0             │
      # │                                                               │
      # │   ◄─────────────────── LEFT TO RIGHT ───────────────────►     │
      # └───────────────────────────────────────────────────────────────┘
      enp2s0f1np1: { dhcp4: false, dhcp6: false, accept-ra: false, optional: true }
      enp2s0f0np0: { dhcp4: false, dhcp6: false, accept-ra: false, optional: true }
      enp89s0: { dhcp4: false, dhcp6: false, accept-ra: false }
      enp87s0: { dhcp4: true, dhcp6: false, accept-ra: false, optional: true }
    bridges:
      virbr-libvirt:
        dhcp4: false
        dhcp6: false
        accept-ra: false
        # MAC format spec 'b2:1d:6e:' + last 3 octets of the physical bridged interface (stands for 'bR:Id:Ge')
        macaddress: "b2:1d:6e:17:01:ab"
        # the actual interface label will change if extra PCIe NIC is added
        interfaces: [ enp89s0 ]
        addresses:
          - "192.168.7.2/24"
        # the default route & nameserver IP is equivalent to the router-X BMC mgmt network IP
        # we may want to add other router IP as secundary default route (weighted by route metric) and nameserver
        routes:
          - { to: default, via: 192.168.7.1 }
        nameservers: { addresses: [ 192.168.7.1 ], search: [ "phoenix.bcn" ] }
  ssh:
    authorized-keys:
      - 'ssh-ed25519 AAAA... your-key-here'
    install-server: true
  identity:
    hostname: router-0-host
    realname: 'Midokura Ubuntu'
    username: ubuntu
    # mkpasswd --method=sha-512 ${PASSWORD}
    password: 'your-hashed-password-here'
  storage:
    grub:
      reorder_uefi: false
    swap:
      size: 0
    config:
      - { type: disk, ptable: gpt, path: /dev/nvme0n1, wipe: superblock-recursive, preserve: false, name: '', grub_device: false, id: disk-nvme0n1 }
        # EFI partition on nvme
      - { type: partition, device: disk-nvme0n1, number: 1, size: 268435456, name: EFI, wipe: superblock, flag: boot, preserve: false, grub_device: true, id: partition-nvme0n1p1 }
      - { type: format, volume: partition-nvme0n1p1, fstype: fat32, name: EFI, preserve: false, id: format-efi }
      - { type: mount, path: /boot/efi,  device: format-efi,  id: mount-efi }
        # root partition on nvme
      - { type: partition, device: disk-nvme0n1, number: 2, size: -1, name: root, wipe: superblock, flag: '', preserve: false, grub_device: false, id: partition-nvme0n1p2 }
      - { type: format, volume: partition-nvme0n1p2, fstype: ext4, name: root, preserve: false, id: format-root }
      - { type: mount, path: /, device: format-root, id: mount-root }
  refresh-installer:
    update: true
  updates: security
  package_update: true
  packages: [ lm-sensors, vim, curl, tree, bridge-utils, libvirt-clients, chrony, git, build-essential, unzip, file, qemu-kvm, libvirt-daemon-system, virtiofsd, virtinst, guestfs-tools, cloud-image-utils ]
  late-commands:
    - 'sed -i "s|GRUB_TIMEOUT=0|\0\nGRUB_RECORDFAIL_TIMEOUT=3|" /target/etc/default/grub'
    - 'sed -i "s|timeout=30|timeout=3|" /target/boot/grub/grub.cfg'
    - curtin in-target --target=/target -- update-grub
    - 'mkdir -p /target/root/.ssh'
    - 'cp -ar /var/log/installer /target/root/'
    - 'mkdir -p /target/etc/systemd/system/systemd-networkd-wait-online.service.d'
    - 'echo "[Service]\nExecStart=\nExecStart=/usr/lib/systemd/systemd-networkd-wait-online --any" > /target/etc/systemd/system/systemd-networkd-wait-online.service.d/override.conf'
```

Values to Customize:

- `identity.hostname` - Set appropriate hostname (e.g., `router-0-host`, `router-1-host`)
- `identity.password` - Generate with `mkpasswd --method=sha-512 ${PASSWORD}`
- `network.bridges.virbr-libvirt.macaddress` - Use format `b2:1d:6e:` + last 3 octets of the physical bridged interface
- `network.bridges.virbr-libvirt.addresses` - Set appropriate IP for the router
- `network.bridges.virbr-libvirt.routes` and `nameservers` - Set to the router BMC management network IP

#### usb drive

Prepare a small USB drive with cloud-init configuration:

```bash
# Assuming an empty USB flash drive on /dev/sdX, as root:
parted /dev/sdX mklabel gpt
parted /dev/sdX mkpart CIDATA fat32 1MB 100%
mkfs.vfat -F 32 -n CIDATA -v /dev/sdX1
mkdir -p /mnt/usb
mount /dev/sdX1 /mnt/usb
cp user-data /mnt/usb/
touch /mnt/usb/meta-data
umount /mnt/usb
```

## Installation

1. Plug in both USB drives
2. Ensure Secure Boot is disabled
3. Boot from the Ubuntu installer USB
4. The Ubuntu installer will auto-start and complete the unattended installation

For real devices with Internet connectivity, uncomment the `packages` and change `updates` sections in the user-data file to install additional packages during installation.

## Creating the `bastion0` virtual machine

The `bastion0` VM will be used to bootstrap and deploy all components from the Phoenix environment. To set it up you just need to execute:

```bash
LIBVIRT_DIR=/var/lib/libvirt/images
# Download the cloud image
sudo wget https://cloud-images.ubuntu.com/noble/current/noble-server-cloudimg-amd64.img \
  -O $LIBVIRT_DIR/noble-server-cloudimg-amd64.img

cat > user-data <<EOF
#cloud-config
hostname: bastion0
user: ubuntu
ssh_authorized_keys:
  - ssh-rsa AAAA... your-key-here
package_update: true
packages:
  - python3
  - python3-pip
  - python3-venv
network:
  version: 2
  ethernets:
    all:
      match:
        name: "e*"
      dhcp4: true
      nameservers:
        addresses:
          - 192.168.33.251 # OpenWRT router IP
          - 8.8.8.8
        search:
          - "phoenix.tyo"
          - "tyo"

      dhcp4: false
#      macaddress: "00:ec:ef:7a:f3:8f"
      routes:
      - metric: 200
        to: "default"
        via: "192.168.32.1"
      - metric: 100
        to: "default"
        via: "192.168.33.251" # router-0.tyo
#      - metric: 99
#        to: 10.30.0.0/16
#        via: "192.168.33.251" # router-0.tyo

EOF
touch meta-data

sudo cloud-localds $LIBVIRT_DIR/cloud-init.iso user-data meta-data

# Create a 128GB disk from the cloud image
sudo qemu-img create \
  -f qcow2 -F qcow2 \
  -b $LIBVIRT_DIR/noble-server-cloudimg-amd64.img $LIBVIRT_DIR/ubuntu-noble-vm.qcow2 128G

# Create the VM
sudo virt-install \
  --name bastion0 \
  --vcpus 2 \
  --memory 4096 \
  --disk $LIBVIRT_DIR/ubuntu-noble-vm.qcow2,device=disk \
  --disk $LIBVIRT_DIR/cloud-init.iso,device=cdrom \
  --network bridge=virbr-libvirt \
  --os-variant ubuntu24.04 \
  --import \
  --graphics vnc,listen=0.0.0.0 \
  --console pty,target_type=serial \
  --noautoconsole
```
