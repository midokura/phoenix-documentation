# Ironic Baremetal Node Creation

## Description

This document covers the required infrastructure setup, the step-by-step process for registering and deploying physical servers, and reference information about Ironic's architecture including networks, services, and deployment mechanisms.

## Requirements
1. From `bastion0`, use the asset `./scripts/main.sh --shell` to get access to openstack cli.
2. Run `source /infra-management/config/admin-openrc.sh` to get the credentials into the environment.
3. **Create baremetal flavor**

   You need to define a "flavor" that tells OpenStack this is for baremetal servers, not virtual machines. The special resource properties ensure OpenStack knows to provision a full physical server instead of trying to create a VM.

   ```bash
    openstack flavor create \
        --ram 262144 \
        --disk 3725 \
        --vcpus 8 \
        --property resources:CUSTOM_BAREMETAL=1 \
        --property resources:VCPU=0 \
        --property resources:MEMORY_MB=0 \
        --property resources:DISK_GB=0 \
        baremetal-flavor
   ```

4. **Create the tenant network**

   ```bash
   openstack network create \
     --provider-network-type vlan \
     --provider-physical-network physnet1 \
     --provider-segment 1001 tenant-a-net \
     tenant-net

   openstack subnet create \
     --network tenant-net \
     --subnet-range 10.40.1.0/24 \
     --dhcp \
     --allocation-pool start=10.40.1.10,end=10.40.1.254 \
     --gateway 10.40.1.1 \
     --dns-nameserver 10.30.0.1 \
     tenant-net-subnet
   ```

5. **Create the tenant external router**

   ```bash
   openstack router create tenant-ext
   openstack router set tenant-ext --external-gateway external-net
   openstack router add subnet tenant-ext tenant-net-subnet
   ```

---

## Process

### Process Overview

The provisioning process involves several state transitions:

- **Enroll → Manageable**: Verify Ironic can communicate with the server's BMC
- **Manageable → Inspecting → Manageable**: Discover hardware specifications
- **Manageable → Available**: Clean the server and prepare it for deployment
- **Available → Deploying → Active**: Install the OS and boot into production

### Provisioning a Node

This assumes you already have access to OpenStack from the client and you have loaded the admin credentials into the environment.

#### 1. Create the baremetal node

This registers the physical server with Ironic by telling it how to control the machine remotely (via IPMI), where to find the boot images, and what type of hardware resource it is.

```bash
NODE_NAME=test-node-01
IPMI_ADDRESS="192.168.7.200"
IPMI_USERNAME="admin"
IPMI_PASSWORD=""
MAC_ADDRESS="3c:fd:fe:9e:6d:d0"
# Update with images IDs from `openstack image list`
DEPLOY_KERNEL="$(openstack image show deploy-kernel -f value -c id)"
DEPLOY_RAMDISK="$(openstack image show deploy-ramdisk -f value -c id)"
RESOURCE_CLASS="baremetal"

openstack baremetal node create \
  --name $NODE_NAME \
  --driver ipmi \
  --network-interface neutron \
  --driver-info ipmi_address="$IPMI_ADDRESS" \
  --driver-info ipmi_username="$IPMI_USERNAME" \
  --driver-info ipmi_password="$IPMI_PASSWORD" \
  --driver-info deploy_kernel="$DEPLOY_KERNEL" \
  --driver-info deploy_ramdisk="$DEPLOY_RAMDISK" \
  --resource-class "$RESOURCE_CLASS"

NODE_UUID=$(openstack baremetal node show $NODE_NAME -f value -c uuid)
```

#### 2. Create the neutron port

This tells Ironic which network interface (MAC address) on the physical server should be used for network booting and connects it to the proper network infrastructure.

```bash
openstack baremetal port create \
  --name $NODE_NAME-port \
  --node $NODE_UUID \
  --pxe-enabled true \
  --physical-network physnet1 \
  $MAC_ADDRESS

PORT_UUID=$(openstack baremetal port show $NODE_NAME-port -f value -c uuid)

# We are not sure this is necessary
openstack baremetal port set $PORT_UUID \
  --local-link-connection switch_id="b0:4f:13:7f:1d:a2" \
  --local-link-connection port_id=Ethernet8 \
  --local-link-connection switch_info=sonic-bcn
```

#### 3. Put node into manage mode

This moves the node from "enroll" (just registered) to "manageable" state—Ironic verifies it can actually talk to the server's management controller using the IPMI credentials you provided.

```bash
openstack baremetal node manage $NODE_UUID
openstack baremetal node show $NODE_UUID -f value -c provision_state -c last_error
```

#### 4. Inspect the node

This makes Ironic automatically discover the server's hardware details (CPU, RAM, disks, etc.) by booting a special inspection image and gathering information, which then gets saved to the node's properties.

```bash
# Optionally we can set an authorized key to ssh into IPA so we can debug
PUBLIC_IPA_SSH_KEY=""
openstack baremetal node set --driver-info kernel_append_params="nofb nomodeset vga=normal \
console=tty0 console=ttyS0,115200n8 sshkey=\"$PUBLIC_IPA_SSH_KEY\"" $NODE_UUID

openstack baremetal node inspect $NODE_UUID
openstack baremetal node show $NODE_UUID -c provision_state -c last_error

# You should see now more properties automatically set
openstack baremetal node show "$NODE_NAME" -c properties -c extra
```

#### 5. Make node available

This moves the node to "available" state, meaning it's ready to have operating systems deployed on it—Ironic will also perform automated cleaning (wiping data, resetting BIOS, etc).

```bash
openstack baremetal node provide $NODE_UUID
openstack baremetal node show "$NODE_NAME" -c provision_state
```

#### 6. Create userdata file

This prepares a cloud-init configuration file that sets up the initial password and SSH access when the operating system first boots. Customize this script with the user needs.

```bash
cat <<EOF > /tmp/userdata.txt
#cloud-config
password: ubuntu
chpasswd: { expire: False }
ssh_pwauth: True
EOF
```

#### 7. Create the server

This actually deploys an operating system image onto the physical server using all the configuration you've set up—it picks the right hardware (using the baremetal flavor), installs the OS image, connects it to the tenant network, and applies the userdata.

```bash
openstack server create \
  --flavor baremetal-flavor \
  --image "Ubuntu Server Noble LTS (Cloud) raw" \
  --key-name everyone \
  --network tenant-net \
  --user-data /tmp/userdata.txt \
  --config-drive true \
  my-special-server
```

#### 8. Switch to the tenant network

Once the server is provisioned, it will restart again, and at that moment we need to switch in Hedge Hog Switch from the provisioning network to the tenant network.

```bash
ssh core@control-1.bcn
kubectl delete vpcattachments provision--default--gpu0--frontend--leaf0
kubectl apply -f tenant0--default--gpu0--frontend--leaf0.yaml
```
