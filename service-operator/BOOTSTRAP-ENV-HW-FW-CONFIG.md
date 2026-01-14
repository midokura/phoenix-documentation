## host-router box

TODO

## OOB Management Switch Fabric:

TODO


## Front-End Switch Fabric

Device: frontend_leaf0

This section describes the baseline requirements and access methods for the front-end switch fabric, with examples taken from the BCN environment.

#### BIOS and ONIE Requirements

In general, you should be able to run the latest available BIOS and ONIE versions supported by the platform.

In the BCN environment, the following versions are currently in use:

Switch profile: dell-s5232f-on

ONIE firmware updater: v3.40.5.1-7

BIOS version: v3.40.0.9-7

These versions are known to work well together and can be used as a reference baseline.

#### Management Interface MAC Addresses

To inspect MAC addresses learned by the switch, you first need console access.

Accessing the Switch Console

SSH into the router host:

```
ssh ubuntu@router.bcn
```


Open a console session to the switch (example using a USB serial device):

```
sudo minicom -D /dev/ttyUSB1 -b 9600
```

Displaying MAC Addresses

Once connected to the switch CLI, run:
```
show mac-address
```

Example output:

```
Codes: *N - VLT Peer Synced MAC
       *I - Internal MAC Address used for Inter Process Communication

VlanId  Mac Address           Type     Interface  State
1       52:54:00:a1:ac:ff     Dynamic  Te 0/4     Active
1       62:cc:a5:c9:93:4d     Dynamic  Te 0/11    Active
...
```

This output shows dynamically learned MAC addresses on VLAN 1 and the interfaces on which they were detected.

#### Console Port Connection

The console port provides out-of-band management access to the switch. It is typically used for initial configuration, recovery, and troubleshooting.

Connection Overview

Connect a console cable from the switch’s console port to the router host or management server.

If the server does not have a native serial port, use a USB-to-serial adapter.

Access the console using terminal software such as minicom, screen, or picocom.

This method allows you to manage the switch even when the network interfaces are not yet configured or are unavailable.


## Management & Storage Servers

Ceph Reference Solution – PXE & Infrastructure Notes


#### Host Mapping
Hedgehog Fabric (generic identifiers)

| Logical Name | Description | Switch | Port | Interface | VPC |
| :--- | :--- | :--- | :--- | :--- | :--- |
| storage0 | Storage Node | frontend_leaf0 | E1/21 | ens1 | Operator VPC (native VLAN) |
| storage1 | Storage Node | frontend_leaf0 | E1/19 | ens5f0np0 | Operator VPC (native VLAN) |
| storage2 | Storage Node | frontend_leaf0 | E1/17 | ens1 | Operator VPC (native VLAN) |
#### Ceph / OpenStack View

| Hostname | Logical Node | IP | Roles |
| :--- | :--- | :--- | :--- |
| zamorano | storage0 | 10.30.0.20 | Ceph MON, RGW (8080) |
| mozzarella | storage1 | 10.30.0.21 | Ceph MON, RGW (8080) |
| ricotta | storage2 | 10.30.0.22 | Ceph MON, RGW (8080) |
#### IPMI Targets

| Node | IPMI Host |
| :--- | :--- |
| storage0 | storage0-ipmi.bcn |
| storage1 | storage1-ipmi.bcn |
| storage2 | storage2-ipmi.bcn |
#### PXE Boot Requirements

- PXE boot must be enabled in BIOS

- The PXE NIC must be the frontend network card

- The NIC MAC address must match the PXE configuration

BIOS example access: https://srvrack-as-1115cs-down-ipmi.tyo/

#### PXE Configuration

PXE Config Source

PXE configs are stored in: https://github.com/midokura/gpu-infrastructure/tree/main/pxe-os-provisioner/sites/openstack-lab.tyo

Each Ceph host must have:

- Correct hostname
- Correct MAC address
- Correct PXE profile

Update PXE on Router
```
ssh -A router-0-host.tyo
cd /media/libvirt-vm-share/gpu-infrastructure/
git pull

ssh router-0.tyo
cd /mnt/host-shared/gpu-infrastructure/pxe-os-provisioner
SITE=openstack-lab.tyo PXE_TARGET_DIR=/www/boot/tftp ./setup_pxe.sh

/etc/init.d/dnsmasq reload
```
#### Reboot into PXE (IPMI)

Example:
```
ipmitool -C3 -I lanplus -H srvrack-as-1115cs-down-ipmi.tyo -U ADMIN -P 'password' chassis bootdev pxe options=efiboot
ipmitool -C3 -I lanplus -H srvrack-as-1115cs-down-ipmi.tyo -U ADMIN -P 'password' chassis power soft
ipmitool -C3 -I lanplus -H srvrack-as-1115cs-down-ipmi.tyo -U ADMIN -P 'password' chassis power on
```
#### Validation Checklist

Before reboot:

- [ ] Ceph cluster healthy
- [ ] PXE config updated
- [ ] dnsmasq reloaded
- [ ] BIOS PXE NIC matches MAC in PXE config

After reboot:

- [ ] Host boots via PXE
- [ ] Correct PXE profile is used
