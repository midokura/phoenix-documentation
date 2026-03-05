# Management Cluster Subnet Migration

## Overview

The management cluster was originally deployed on `192.168.249.0/24`. As part of network topology consolidation, it needs to run on `10.32.0.0/16` instead — same network name, different subnet. This document describes the automated migration flow, when to trigger it, and what to expect.

This will need to be done in any old installation previous to version 1.11.0 and before any update after version 1.11.0

## How to run on an existing installation

Follow these instructions to start the migration. By default, you can run the setups scripts as normal, and the migration won't be executed.

### Operator VPN new Allowed IP

You will need to update your wireguard config by appending the new subnet CIDR.

```
AllowedIPs = <PREVIOUS_ALLOWED_IPS>, 10.32.0.0/16
```

All operators will need to update their VPN configuration with this new address.

### Create a backup of the database

Run the setup script on shell mode: `./scripts/platform-setup.sh --shell`. Once inside, execute the following.

Create a pod by running:

```bash
kubectl apply -f - <<'EOF'
apiVersion: v1
kind: Pod
metadata:
  name: iaas-backup-pod
  namespace: iaas-console
spec:
  restartPolicy: Never
  imagePullSecrets:
  - name: midokura-registry
  securityContext:
    fsGroup: 1000
    runAsNonRoot: false
    seccompProfile:
      type: RuntimeDefault
  containers:
  - name: backup
    image: ghcr.io/midokura/iaas-backup:latest
    imagePullPolicy: Always
    command: ["sleep", "infinity"]
    env:
    - name: PG_HOST
      value: iaas-api-postgresql-primary.iaas-console.svc.cluster.local
    - name: PG_PORT
      value: "5432"
    - name: PG_USER
      value: iaas
    - name: PG_DATABASE
      value: iaas
    - name: PGPASSWORD
      valueFrom:
        secretKeyRef:
          key: password
          name: iaas-api-postgresql
    securityContext:
      allowPrivilegeEscalation: false
      capabilities:
        drop:
        - ALL
    volumeMounts:
    - mountPath: /tmp
      name: tmp
  volumes:
  - name: tmp
    emptyDir:
      sizeLimit: 5Gi
EOF
```

Now let's run the backup from inside the pod:

```bash
kubectl exec -it iaas-backup-pod -n iaas-console -- bash

BACKUP_FILE="/tmp/iaas_console.dump.gz"
pg_dump -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$PG_DATABASE" \
  --format=custom --no-owner \
| gzip -9 > "$BACKUP_FILE"
exit
```

And copy the backup into deployment0.

```bash
kubectl cp iaas-console/iaas-backup-pod:/tmp/iaas_console.dump.gz /infra-management/iaas_console.dump.gz
```

Don't lose it. We will use it later.

### Disconnect tenants from management-net

Keep running the setup script as shell mode: `./scripts/platform-setup.sh --shell`

We need to disconnect all tenants from the old management-net to be able to recreate it with the new one.

For each tenant run:

```
ROUTER_ID=<tenant router>
PORTS=$(openstack port list \
    --device-id "$ROUTER_ID" \
    --format value \
    -c ID -c Name \
    | grep "tenant-router-mgmt-")

if [[ -z "$PORTS" ]]; then
    echo "  No tenant-router-mgmt-* ports found, skipping."
    continue
fi

while IFS= read -r line; do
    PORT_ID=$(echo "$line" | awk '{print $1}')
    PORT_NAME=$(echo "$line" | awk '{print $2}')
    echo "  Removing port: $PORT_NAME ($PORT_ID)"
    openstack router remove port "$ROUTER_ID" "$PORT_ID"
done <<< "$PORTS"
```

### Allow tenant SGs new subnet

Keep running the setup script as shell mode: `./scripts/platform-setup.sh --shell`

Finally exit shell mode.

### Start the subnet migration

Run the provisioning script with `./scripts/platform-setup.sh -e migrate_mgt_cluster: true` to trigger the migration on an existing AI Factory deployment.

This variable gates the backup, teardown, and restore steps. **Normal deployments (no migration) are completely unaffected** — the variable defaults to `false` and all migration steps are skipped.

Once migration completes, remove the flag or set it back to `false`. The playbooks detect completion via OpenStack subnet state and will not re-run migration on subsequent executions.

### Connect tenant network back to management-net

Run again the setup script as shell mode: `./scripts/platform-setup.sh --shell`

**All tenant variables**
```
MGMT_NET="management-net"
MGMT_SUBNET_ID="management-subnet"
MGMT_ROUTER="management-router"
MGMT_NET_CIDR="10.32.0.0/16"
```

**Per-tenant values (repeat block below for each tenant)**
Do this for each existing tenant.
```
TENANT_ROUTER="<tenant-n-router>"
TENANT_SUBNET_CIDR="<tenant-n-subnet-cidr>"  # e.g. 10.30.1.0/24
TENANT_FIXED_IP="<unique-ip-in-mgmt-net>"    # unique IP on management-net for this tenant router
TENANT_VPN_VM="<tenant-n-vpn-vm>"
```

1. To the tenant router, add management-net as an interface with a unique ip.

```
openstack router add subnet \
  --fixed-ip subnet=$MGMT_SUBNET_ID,ip-address=$TENANT_FIXED_IP \
  $TENANT_ROUTER $MGMT_SUBNET_ID
```

2. Again, in the tenant router, add back the static route to management-net router.

```
openstack router set \
  --route destination=$MGMT_NET_CIDR,gateway=<mgmt-router-ip-in-mgmt-net> \
  $TENANT_ROUTER
```

3. Add static route in management-router to tenant subnet with the tenant router fixed ip.

```
openstack router set \
  --route destination=$TENANT_SUBNET_CIDR,gateway=$TENANT_FIXED_IP \
  $MGMT_ROUTER
```

4. Reboot tenant VPN VM.

```
openstack server reboot $TENANT_VPN_VM
```

### Restore the database from the backup


Run the setup script on shell mode: `./scripts/platform-setup.sh --shell`. Once inside, execute the following.

Create a pod by running:

```bash
kubectl apply -f - <<'EOF'
apiVersion: v1
kind: Pod
metadata:
  name: iaas-backup-pod
  namespace: iaas-console
spec:
  restartPolicy: Never
  imagePullSecrets:
  - name: midokura-registry
  securityContext:
    fsGroup: 1000
    runAsNonRoot: false
    seccompProfile:
      type: RuntimeDefault
  containers:
  - name: backup
    image: ghcr.io/midokura/iaas-backup:latest
    imagePullPolicy: Always
    command: ["sleep", "infinity"]
    env:
    - name: PG_HOST
      value: iaas-api-postgresql-primary.iaas-console.svc.cluster.local
    - name: PG_PORT
      value: "5432"
    - name: PG_USER
      value: iaas
    - name: PG_DATABASE
      value: iaas
    - name: PGPASSWORD
      valueFrom:
        secretKeyRef:
          key: password
          name: iaas-api-postgresql
    securityContext:
      allowPrivilegeEscalation: false
      capabilities:
        drop:
        - ALL
    volumeMounts:
    - mountPath: /tmp
      name: tmp
  volumes:
  - name: tmp
    emptyDir:
      sizeLimit: 5Gi
EOF
```

Copy the backup back to the pod:

```bash
kubectl cp /infra-management/iaas_console.dump.gz iaas-console/iaas-backup-pod:/tmp/iaas_console.dump.gz
```

Now let's run the restore from inside the pod:

```bash
kubectl exec -it iaas-backup-pod -n iaas-console -- bash

DUMP_FILE="/tmp/iaas_console.dump"
gunzip ${DUMP_FILE}.gz
pg_restore -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$PG_DATABASE" \
    --clean --if-exists --no-owner --single-transaction --exit-on-error $DUMP_FILE
```
