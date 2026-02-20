# Network Control Node Setup

Provisioning the control node and installing SONiC.

This guide walks you through provisioning the control node that manages the network fabric, then installing SONiC on the switches.

## What You're Doing

You'll deploy a VM on the bastion node that acts as the control plane for the HedgeHog network fabric. This control node will then manage the installation and configuration of SONiC on your network switches. The fabric configuration and wiring are pre-baked into the installer ISO.

## Before You Start

### Prerequisites Checklist

- [ ] **Bastion Node Access** - SSH access to bastion node → [Details](#bastion-node-access)
- [ ] **Control Node ISO** - Download URL for HedgeHog Control node ISO → [Details](#control-node-iso)
- [ ] **Switch Access** - Serial console access to network switches → [Details](#switch-access)

### Bastion Node Access

- **What it is:** SSH access to the bastion/jump host where the control VM will run
- **Purpose:** Deploy and manage the network control node
- **What you need:**
  - SSH key and credentials
  - Sufficient resources on bastion: 8-12 vCPU, 16 GiB RAM, 35 GB disk space for the control VM

### Control Node ISO

- **What it is:** Pre-built installer ISO for the network control node
- **Purpose:** Contains the HedgeHog control plane with pre-configured fabric settings and wiring
- **What you need:** Download (Azure Blob Storage) URL previously provided

### Switch Access

- **What it is:** Serial console access to SONiC-compatible network switches
- **Purpose:** Boot switches into ONIE for SONiC installation
- **How to access:**
  ```bash
  sudo minicom -D /dev/ttyUSB1 -b 115200
  ```

If a person is already connected, another person can connect with:
  ```
sudo socat -d -d /dev/ttyUSB1,raw,echo=0 stdout
  ```
- **What you need:** Physical serial connection to switches

## Installation Steps

### Step 1: Download Control Node ISO

On the bastion node, download the pre-built ISO:

```bash
# Use the SAS URL from your materials PDF
wget -O hedgehog-installer.iso "https://your-storage-account.blob.core.windows.net/path/to/hedgehog-installer.iso?sp=r&st=..."
```

Verify the download:

```bash
ls -lh hedgehog-installer.iso
```

### Step 2: Create Control VM on Bastion

Create and start the control node VM using the ISO. The control node requires:
- **vCPU:** 8-12 cores
- **RAM:** 16 GiB
- **Disk:** 35 GB

Set up variables for your environment:

```bash
# Adjust these paths and names for your environment
IMG_DIR=/var/lib/libvirt/images
VM_NAME=hedgehog-control
UBNT_REL_YEAR="24.04"
VM_VCPU=8
VM_RAM=16384
ROOTFS_SIZE=35G

# Adjust these for your network setup
VM_MAC=52:54:00:a1:ac:ff  # Must be unique
VM_BRIDGE=br-mgmt          # Your management network bridge
```

Prepare the blank OS image:

```bash
sudo qemu-img create -f qcow2 ${IMG_DIR}/${VM_NAME}.qcow2 ${ROOTFS_SIZE}
sudo chown -v libvirt-qemu:kvm ${IMG_DIR}/${VM_NAME}.qcow2
sudo chmod -v 664 ${IMG_DIR}/${VM_NAME}.qcow2
```

Set permissions on the installer ISO:

```bash
# Assuming hedgehog-installer.iso is in the same directory
sudo chown -v libvirt-qemu:kvm ${IMG_DIR}/hedgehog-installer.iso
sudo chmod -v 664 ${IMG_DIR}/hedgehog-installer.iso
```

Create and start the VM:

```bash
virt-install --name=${VM_NAME} \
  --os-variant=ubuntu${UBNT_REL_YEAR} \
  --machine q35 \
  --boot firmware=efi,firmware.feature0.name=secure-boot,firmware.feature0.enabled=no \
  --tpm none \
  --vcpu=${VM_VCPU} \
  --ram=${VM_RAM} \
  --disk path=${IMG_DIR}/${VM_NAME}.qcow2,bus=virtio \
  --cdrom=${IMG_DIR}/hedgehog-installer.iso \
  --network bridge=${VM_BRIDGE},mac=${VM_MAC} \
  --noautoconsole
```

**Note:** The exact VM creation method depends on your bastion's virtualization setup (KVM/libvirt, VMware, etc.). If you need PCI passthrough for additional network devices, add `--host-device=pci_XXXX_XX_XX_X` to the command.

The installation process is automated. Monitor progress via console:

```bash
virsh console ${VM_NAME}
```

The VM will shut itself down when installation is complete. Once it's done, start it:

```bash
virsh start ${VM_NAME}
```

### Step 3: Verify Control Node

Check that the control node VM is running and accessible:

```bash
# Check VM status
sudo virsh list --all

# Console into the VM to get IP addresses
virsh console ${VM_NAME}
```

Once logged in via console, list all IP addresses:

```bash
# List all network interfaces and their IPs
ip -br addr show

# Or for more detail
ip addr show
```

Note the IP address(es) and use them to SSH from your workstation if needed:

```bash
ssh core@<control-node-ip>
```

Verify HedgeHog services are running:

```bash
kubectl get pods -A
```

All pods should be in Running state.

#### Step 3.1: Apply the fabric configuration to HedgeHog Control Plane

On the HedgeHog control node VM, download the pre-configured network fabric configuration:

```bash
# Use the SAS URL from your materials PDF
wget -O hedgehog-fabric-configuration.yaml "https://your-storage-account.blob.core.windows.net/path/to/hedgehog-fabric-configuration.yaml?sp=r&st=..."
```

Apply the configuration:

```bash
kubectl apply -f hedgehog-fabric-configuration.yaml
```

### Step 4: Prepare Switches for SONiC Installation

For each switch, you'll set up ONIE to pull the SONiC installer from a temporary HTTP server.

#### 4.1: Setup HTTP Server for ONIE

On a machine reachable from the switch management network (can be the bastion):

Create the directory for ONIE files:

```bash
mkdir -p /home/ubuntu/boot-http-server
```

Start nginx container to serve ONIE files:

```bash
docker run -d --name onie-server \
  -p 8080:80 \
  -v /home/ubuntu/boot-http-server:/usr/share/nginx/html \
  nginx
```

#### 4.2: Download ONIE Firmware

Download the ONIE image appropriate for your switch model directly to the HTTP server directory:

```bash
# Download URL will be provided in your materials PDF
# Or obtain from your switch vendor's support site
cd /home/ubuntu/boot-http-server
wget -O onie-updater.bin "https://vendor-url/onie-updater.bin"
```

**Note:** The exact ONIE firmware filename and version will vary based on your switch hardware. Check your materials PDF for the correct download URL.

#### 4.3: Access Switch Console

Connect to each switch via serial console:

```bash
sudo minicom -D /dev/ttyUSB1 -b 115200
# (adjust device path for each switch)
```

#### 4.4: Update ONIE Firmware (only if not in the latest version)

From the ONIE prompt, update the ONIE firmware using the HTTP server (nginx container) we set up in step 4.1:

```bash
# In ONIE prompt
onie-stop
onie-self-update http://192.168.0.XX:8080/onie-updater.bin
```

Replace `192.168.0.XX` with the IP address of the machine running the nginx container and `onie-updater.bin` with your actual ONIE firmware filename.

#### 4.5: Boot into ONIE Mode

After ONIE firmware is updated, reboot the switch to boot into ONIE:

From the switch console:

1. Reboot the switch:
   ```bash
   sudo reboot
   ```
2. Wait till GRUB selection appears
3. Quickly select "ONIE"
4. Select "ONIE: Install OS"

### Step 5: Install SONiC via HedgeHog

Once switches are in ONIE mode, HedgeHog will automatically detect them on the management network and begin SONiC installation via DHCP.

Monitor agent heartbeats and configuration from the control node:

```bash
# SSH to control node
ssh core@<control-node-ip>

# Watch for agent heartbeats and configuration generation
kubectl get agent -o wide -w
```

Wait for agents to send heartbeats and show current/applied configuration generation.

### Step 6: Verification

List switches and SSH to them:

```bash
# List switches to get switch names
kubectl get switches

# SSH to a switch using its name
kubectl fabric switch ssh --name <switch-name>
```

Use the default HedgeHog admin password when prompted.

**Troubleshooting:** If the agent doesn't send heartbeats, check the agent logs via serial console:

```bash
# From switch serial console
cat /var/log/agent.log
```

## Troubleshooting

### Control VM Won't Boot

- Verify ISO downloaded completely: `sha256sum hedgehog-installer.iso`
- Check VM resources are sufficient (8-12 vCPU, 16 GiB RAM, 35 GB disk)
- Review VM console logs: `sudo virsh console ${VM_NAME}`

### Switch Not Getting ONIE Firmware

- Verify HTTP server is accessible: `curl http://192.168.0.XX:8080/onie-updater.bin`
- Check switch can reach HTTP server from management network
- Verify ONIE firmware file is in correct directory
- Check nginx container is running: `docker ps`

### Switches Not Appearing in Fabric

- Verify control node has connectivity to management network
- Check DHCP is working on management network
- Review the HedgeHog installation log:
  - `tail -f /var/log/install.log`
- Review fabric controller logs: 
  - `kubectl logs -n fab -l app.kubernetes.io/name=fabricator`
  - `kubectl logs -n fab -l app.kubernetes.io/name=fabric`
- Ensure switches completed ONIE update and rebooted

### Can't SSH to Control Node

- Console into VM and check IP addresses: `virsh console ${VM_NAME}` then `ip -br addr show`
- Verify VM got IP via DHCP on management network
- Check network bridge configuration on bastion
- Verify VM network is connected to management network

## References

- HedgeHog Official Documentation: https://docs.hedgehog.cloud/
