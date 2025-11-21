# Setup Ceph - Generic

This process guides through installing Ceph cluster on bare-metal nodes, using podman as an orchestration manager. This deployment method is officially recommended by upstream.

### You need to know:

- **"OS ip address"**: We will use env var `OS_IP_ADDRESS_X` in the guide for each node where X is the node number. It should be something like `192.168.6.204`
- **"OS host"**: We will use env var `HOSTNAME_X` in the guide for each node where X is the node number. It should be the host name of each server.
- **"Cluster network subnet"**: We will use env var `CLUSTER_SUBNET` in the guide. It should be something like `172.28.6.0/24`

## Installation

### 1. Connect to the main ceph node with

```bash
ssh -A ubuntu@$OS_IP_ADDRESS_1
```

### 2. Install cephadm package

```bash
apt install -y cephadm
```

### 3. Generate a uuid

```bash
UUID="$(uuidgen)"
```

### 4. Bootstrap 1st node in the cluster

(FSID can be generated using `uuidgen`)

```bash
cephadm bootstrap --mon-ip $OS_IP_ADDRESS_1 --cluster-network $CLUSTER_SUBNET --fsid $UUID
```

### 5. Access Ceph Dashboard

From the output get the default Ceph Dashboard address, username and password, access it and update the password.

### 6. Inject Ceph admin public SSH key to the remaining nodes

**THIS COMMAND WILL NOT WORK. COPY THE KEYS MANUALLY**

```bash
ssh-copy-id -f -i /etc/ceph/ceph.pub root@$OS_IP_ADDRESS_2
ssh-copy-id -f -i /etc/ceph/ceph.pub root@$OS_IP_ADDRESS_3
```

### 7. Add remaining nodes, directly from 1st node and set them as admin nodes as well

```bash
sudo cephadm shell -- ceph orch host add $HOSTNAME_2 $OS_IP_ADDRESS_2 --labels _admin
sudo cephadm shell -- ceph orch host add $HOSTNAME_3 $OS_IP_ADDRESS_3 --labels _admin
sudo cephadm shell -- ceph orch host ls
```

### 8. Zap (erase/remove) the disks before adding osd

```bash
sudo cephadm shell
ceph orch device zap $HOSTNAME_1 /dev/sdX --force
```

### 9. Start adding dedicated disk devices to the cluster

Start adding dedicated disk devices to the cluster for each disk we want to use as ceph storage where `/dev/sdX` is each disk.

```bash
sudo cephadm shell
ceph orch daemon add osd --method raw $HOSTNAME_1:/dev/sdX
ceph orch daemon add osd --method raw $HOSTNAME_2:/dev/sdX
ceph orch daemon add osd --method raw $HOSTNAME_3:/dev/sdX
```

### 10. Start rados gateway with:

```bash
sudo cephadm shell
ceph orch apply rgw gateway --placement="3 $HOSTNAME_1 $HOSTNAME_2 $HOSTNAME_3" --port=8080
```

Configure Keystone integration:

```bash
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

### 11. Create the rados gateway user:

```bash
radosgw-admin user create --uid="iaas-rgw-admin" --display-name="iaas management user for ceph object gateway admin API" --caps="users=*;buckets=*;usage=*;metadata=*"
```

#### a. Write down the access and secret keys

#### b. Update inventory.yml rgw_auth.access_key and rgw_auth.secret_key by encrypting them with:

```bash
ansible-vault encrypt_string --ask-vault-password $ACCESS_KEY --name access_key
ansible-vault encrypt_string --ask-vault-password $SECRET_KEY --name secret_key
```

### 12. After Openstack configuration have been generated, come back to cephadm and run:

```bash
sudo cephadm shell
ansible-vault view passwords.yml | grep ceph_rgw_keystone_password
ceph config set client.rgw.gateway rgw_keystone_admin_password <ceph_rgw_keystone_password from passwords.yml>
ceph orch restart rgw.gateway
```

## Configuration and Usage

### 1. Create a pool for images:

```bash
ceph osd pool create images 32 32 replicated
ceph osd pool set images size 2

ceph osd pool create volumes 32 32 replicated
ceph osd pool set volumes size 2

ceph osd pool create vms 32 32 replicated
ceph osd pool set vms size 2

ceph osd pool create backups 32 32 replicated
ceph osd pool set backups size 2

# This [client.cinder] secret goes to config/nova/ceph.client.cinder.keyring, config/cinder/cinder-volume/ceph.client.cinder.keyring and
# keyrings/ceph.client.cinder.keyring
ceph auth get-or-create client.cinder mon 'allow r' osd 'allow class-read object_prefix rbd_children, allow rwx pool=volumes, allow rwx pool=vms, allow rx pool=images'

# This [client.cinder-backup] secret goes to keyrings/ceph.client.cinder-backup.keyring
ceph auth get-or-create client.cinder-backup mon 'allow r' osd 'allow class-read object_prefix rbd_children, allow rwx pool=backups'

# This [client.glance] secret goes to keyrings/ceph.client.glance.keyring
ceph auth get-or-create client.glance mon 'allow r' osd 'allow class-read object_prefix rbd_children, allow rwx pool=images'
```

### 2. Copy the output

Copy the output as this is the config that needs to be added into Openstack.

### 3. Enable rbd for the pools

```bash
ceph osd pool application enable images rbd
ceph osd pool application enable volumes rbd
ceph osd pool application enable vms rbd
ceph osd pool application enable backups rbd
```
