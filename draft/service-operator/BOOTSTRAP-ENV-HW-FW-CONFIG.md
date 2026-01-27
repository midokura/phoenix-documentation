# BOOTSTRAP ENVIRONMENT HARDWARE & FIRMWARE CONFIGURATION

This document describes the baseline requirements and access methods for the bootstrap environment hardware and firmware.

## Host-Router Box

#### BIOS Configuration

The BIOS must be on the latest version, and AMT must be enabled.

- **[ROUTER_BOX_SETUP.md](ROUTER_BOX_SETUP.md#bios-configuration)** – Use this documentation as a reference for BIOS and AMT configuration.

#### NIC Configuration

Use the latest firmware available for the NIC.

There must be 5 network interfaces on the host-router.

- 3x SFP+ ports for data traffic. These ports must be assigned to the OpenWRT VM.
  - 1x must connect to the DC.
  - 2x must connect to the front-end switches.
- 2x 2.5G ports for the OOB network.
  - 1x must be used for control traffic to the host-router.
  - 1x must be used for the OOB switch fabric and passed through to the HH (HedgeHog) VM.

To extract the PCI address, SSH into the host-router and run `lspci`.

#### USB Port IDs Connected to Switch Serial Consoles

All front-end, back-end, and OOB switches must have a serial port connection to the Bastion VM to allow access to their serial consoles for troubleshooting and configuration.

The PCI USB device to which all serial ports are connected must be passed through to the Bastion VM.

Stable device naming (udev rules) is strongly recommended to avoid tty reassignment.

For more information about the Bastion VM, refer to  
[ROUTER_BOX_SETUP.md](ROUTER_BOX_SETUP.md#creating-the-bastion0-virtual-machine).

## OOB Management Switch Fabric

The Out-of-Band (OOB) network must use a simple **unmanaged 10/100/1000 switch**.

- **Requirement:** Since the switch is unmanaged, you must collect the MAC addresses of all connected IPMI and management interfaces.
- **Purpose:** These MAC addresses must be used to configure static DHCP lease entries (hostnames) in the router’s `dnsmasq` configuration.

## Front-End and Back-End Switch Fabric

This section describes the baseline requirements and access methods for the front-end and back-end switch fabric.

#### Switch Model

You must know the exact model of the switch in use, as this determines the profile to be used in HH.

#### BIOS and ONIE Requirements

The switch should run the latest BIOS and ONIE versions supported by the platform.

#### Management Interface MAC Addresses

To inspect MAC addresses learned by the switch, you must first obtain console access.

##### Accessing the Switch Console

SSH into the host-router:

```
ssh ubuntu@host-router
```

Open a console session to the switch (example using a USB serial device):

```
sudo minicom -D /dev/ttyUSB1 -b 115200
```

##### Displaying MAC Addresses

Once connected to the switch CLI, run:

```
ip link show eth0 | awk '/ether/ {print $2}'
```

This information is required for HH configuration to bootstrap the SONiC installation.

## Management and Storage Servers

#### Network Interface Configuration

For each server, you must provide:
- The device name and MAC address of the front-end interface.

For storage servers, you must also provide the device names of the storage cluster network interfaces used for internal communication between storage nodes, including control traffic and data replication.

#### BMC Configuration

A user and password must be configured in the BIOS.

#### PXE Boot Requirements

- PXE boot must be enabled in the BIOS.
- The PXE NIC must be the front-end network interface.
