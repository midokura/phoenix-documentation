# Ceph setup - Reference storage implementation

This process guides through installing Ceph cluster on bare-metal nodes, using podman as an orchestration manager. This deployment method is officially recommended by upstream.

## Prerequisites

- The bond0 interface network is created. Here is a user-data example to create it. <!-- FIXME -->
  - For example, for openstack-lab.bcn setup <!-- FIXME --> it consists of 2 10Gb cables bonded together to create a 20Gb interface.
- The Ceph servers should have 2 dedicated blank disks. No partitions, etc. (Do not configure them via user-data)
- The following packages need to be installed: `linux-image-generic-hwe-22.04 linux-headers-generic-hwe-22.04 linux-tools-generic-hwe-22.04 fdutils`
- Removed deactivated or removed snapd and docker
- Install podman and python3-podman
  - e.g. via user-data <!-- FIXME -->
- You need to know:
  - “OS ip address”. We will use env var OS_IP_ADDRESS_X in the guide for each node where X is the node number. It should be something like 192.168.6.204
  - “OS host”. We will use env var HOSTNAME_X in the guide for each node where X is the node number. It should be the host name of each server.
  - “Cluster network subnet”.  We will use env var CLUSTER_SUBNET in the guide. It should be something like 172.28.6.0/24

## Installation

- Connect to the main ceph node with 
```sh
ssh -A -i ~/.ssh/mido_infra ubuntu@$OS_IP_ADDRESS_1
```

- Install cephadm package
```sh
apt install -y cephadm
```

- Generate a uuid 
```
UUID="$(uuidgen)"
```

- Bootstrap 1st node in the cluster (FSID can be generated using uuidgen)
```
cephadm bootstrap --mon-ip $OS_IP_ADDRESS_1 --cluster-network $CLUSTER_SUBNET --fsid $UUID
```

- From the output get the default Ceph Dashboard address, username and password, access the it and update the password. Store it in BitWarden. <!-- FIXME -->
- Inject Ceph admin public SSH key to the remaining nodes
THIS COMMAND WILL NOT WORK. COPY THE KEYS MANUALLY <!-- FIXME -->
```sh
ssh-copy-id -f -i /etc/ceph/ceph.pub root@$OS_IP_ADDRESS_2
ssh-copy-id -f -i /etc/ceph/ceph.pub root@$OS_IP_ADDRESS_3
```

- Add remaining nodes, directly from 1st node and set them as admin nodes as well
```sh
sudo cephadm shell -- ceph orch host add $HOSTNAME_2 $OS_IP_ADDRESS_2 --labels _admin
sudo cephadm shell -- ceph orch host add $HOSTNAME_3 $OS_IP_ADDRESS_3 --labels _admin
sudo cephadm shell -- ceph orch host ls
```

- Zap (erase/remove) the disks before adding osd
```sh
sudo cephadm shell
ceph ceph orch device zap $HOSTNAME_1 /dev/sdX --force
```

- Start adding dedicated disk devices to the cluster for each disk we want to use as ceph storage where /dev/sdX is each disk.
```sh
sudo cephadm shell
ceph orch daemon add osd --method raw $HOSTNAME_1:/dev/sdX
ceph orch daemon add osd --method raw $HOSTNAME_2:/dev/sdX
ceph orch daemon add osd --method raw $HOSTNAME_3:/dev/sdX
```

- Start rados gateway with:
```sh
sudo cephadm shell
ceph orch apply rgw gateway --placement="3 $HOSTNAME_1 $HOSTNAME_2 HOSTNAME_3" --port=8080
# https://docs.ceph.com/en/latest/radosgw/keystone/

# As of the Queens release, Keystone solely implements the Identity API v3.
# Support for Identity API v2.0 has been removed in Queens in favor of the Identity API v3.
# https://docs.openstack.org/keystone/latest/contributor/http-api.html
ceph config set client.rgw.gateway rgw_keystone_api_version 3
ceph config set client.rgw.gateway rgw_keystone_url http://$OPENSTACK_URL:5000
ceph config set client.rgw.gateway rgw_keystone_admin_user ceph_rgw
ceph config set client.rgw.gateway rgw_keystone_admin_domain Default
ceph config set client.rgw.gateway rgw_keystone_admin_project service
# disable token cache because of https://tracker.ceph.com/issues/21226
ceph config set client.rgw.gateway rgw_keystone_token_cache_size 0
#ceph config set client.rgw.gateway rgw_keystone_verify_ssl false
ceph config set client.rgw.gateway rgw_enable_usage_log true # logging

# https://docs.ceph.com/en/latest/radosgw/multitenancy/#swift-with-keystone
ceph config set client.rgw.gateway rgw_keystone_implicit_tenants true

# options
ceph config set client.rgw.gateway rgw_swift_account_in_url false
# https://docs.ceph.com/en/latest/radosgw/s3/authentication/
ceph config set client.rgw.gateway rgw_s3_auth_use_keystone true
```

- Create the rados gateway user:
```sh
radosgw-admin user create --uid="iaas-rgw-admin" --display-name="iaas management user for ceph object gateway admin API" --caps="users=*;buckets=*;usage=*;metadata=*"
```

  - Write down the access and secret keys
  - Update inventory.yml rgw_auth.access_key and rgw_auth.secret_key by encrypting them with:
```
ansible-vault encrypt_string --ask-valut-password $ACCESS_KEY --name secret_key
ansible-vault encrypt_string --ask-valut-password $SECRET_KEY --name access_key
```

- After Openstack configuration have been generated, come back to cephadm and run:
```sh
sudo cephadm shell
ansible-vault view passwords.yml | grep ceph_rgw_keystone_password
ceph config set client.rgw.gateway rgw_keystone_admin_password <ceph_rgw_keystone_password from passwords.yml>
ceph orch restart rgw.gateway
```

## Configuration and Usage

- [Create a pool](https://docs.ceph.com/en/squid/rados/operations/pools/#creating-a-pool) for images:
```sh
ceph osd pool create images 32 32 replicated
ceph osd pool set images size 2

ceph osd pool create volumes 32 32 replicated
ceph osd pool set volumes size 2

ceph osd pool create vms 32 32 replicated
ceph osd pool set vms size 2

ceph osd pool create backups 32 32 replicated
ceph osd pool set backups size 2

# This [client.cinder] secret goes to config/nova/ceph.client.cinder.keyring, config/cinder/cinder-volume/ceph.client.cinder.keyring and config/cinder/cinder-backup/ceph.client.cinder.keyring
ceph auth get-or-create client.cinder mon 'allow r' osd 'allow class-read object_prefix rbd_children, allow rwx pool=volumes, allow rwx pool=vms, allow rx pool=images'

# This [client.cinder-backup] secret goes to config/cinder/cinder-backup/ceph.client.cinder-backup.keyring
ceph auth get-or-create client.cinder-backup mon 'allow r' osd 'allow class-read object_prefix rbd_children, allow rwx pool=backups'

# This [client.glance] secret goes to config/glance/ceph.client.glance.keyring
ceph auth get-or-create client.glance mon 'allow r' osd 'allow class-read object_prefix rbd_children, allow rwx pool=images'
```

- Copy the output as this is the config that needs to be added into Openstack.

- Enable rbd for the pools
```sh
ceph osd pool application enable images  rbd
ceph osd pool application enable volumes rbd
ceph osd pool application enable vms     rbd
ceph osd pool application enable backups rbd
```
