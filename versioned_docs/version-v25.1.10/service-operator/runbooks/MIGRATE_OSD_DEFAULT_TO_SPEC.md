# Migrating LVM OSDs to Raw BlueStore

Migrating LVM-backed OSDs to raw BlueStore specs

## Purpose

Older clusters provisioned OSDs via `ceph orch daemon add osd --method raw`, which internally used LVM. These OSDs are not directly manageable by the orchestrator as individual devices. This section describes how to migrate them safely to raw BlueStore specs.

:::warning

This is a destructive, data-moving operation. Each OSD must be decommissioned (data backfilled away) before the disk is wiped and reprovisioned. The cluster stays online throughout, but each OSD migration triggers a full rebalance cycle — budget significant time for large clusters.

:::

## Prerequisites

- Cluster is `HEALTH_OK` before starting
- Replication factor ≥ 2 (data remains available while one OSD is out)
- You have identified which OSDs are LVM-backed

**Identify LVM-backed OSDs:**

Get all OSDs that are LVM-backed:

```bash
ceph orch device ls -f json | jq '
  [
    .[] |
    . as $host |
    .devices[] |
    select(.lvs | length > 0) |
    {
      host: $host.name,
      osd_name: ("osd." + .lvs[0].osd_id),
      path: .path,
      device_id: .device_id
    }
  ]'
```

This should return something like:

```json
[
  {
    "host": "storage0",
    "osd_name": "osd.0",
    "path": "/dev/sdc",
    "device_id": "ATA_SAMSUNG_MZ7L33T8_S723NS0X400944F"
  },
  {
    "host": "storage0",
    "osd_name": "osd.1",
    "path": "/dev/sdd",
    "device_id": "ATA_SAMSUNG_MZ7L33T8_S723NS0X400949J"
  },
  {
    "host": "storage1",
    "osd_name": "osd.2",
    "path": "/dev/sdc",
    "device_id": "ATA_SAMSUNG_MZ7L33T8_S723NS0X402117E"
  },
  {
    "host": "storage1",
    "osd_name": "osd.3",
    "path": "/dev/sdd",
    "device_id": "ATA_SAMSUNG_MZ7L33T8_S723NS0X400953B"
  },
  {
    "host": "storage2",
    "osd_name": "osd.4",
    "path": "/dev/sdc",
    "device_id": "ATA_SAMSUNG_MZ7L33T8_S723NS0X400934N"
  },
  {
    "host": "storage2",
    "osd_name": "osd.5",
    "path": "/dev/sdd",
    "device_id": "ATA_SAMSUNG_MZ7L33T8_S723NS0X400929E"
  }
]
```

Each entry shows an OSD ID and the device it occupies. Note the OSD ID (`osd.<n>`) and the underlying block device.

## Migration Procedure (per OSD)

Repeat this sequence for each LVM OSD, **one at a time**.

### 1. Mark the OSD out

```bash
cephadm shell -- ceph osd out <osd-id>
```

This tells the cluster to stop using the OSD and begin backfilling its data to remaining OSDs.

### 2. Wait for the cluster to finish rebalancing

```bash
watch cephadm shell -- ceph -s
```

Wait until `health: HEALTH_OK` and `0 degraded` / `0 misplaced` before proceeding.

:::warning[Do not continue if the cluster is not fully recovered]


Proceeding while degraded risks data loss.

:::

### 3. Mark the OSD down and stop the daemon

Bring the OSD process down so the disk can be safely wiped.

```bash
cephadm shell -- ceph osd down osd.<osd-id>
cephadm shell -- ceph orch daemon stop osd.<osd-id>
```

### 4. Wait for the daemon to stop

Confirm the daemon reaches `stopped` state before proceeding to the zap step.

```bash
cephadm shell -- ceph orch ps --service-name osd.default
```

Expected output (the target OSD shows `stopped`):

```
NAME   HOST      PORTS  STATUS         REFRESHED  AGE  MEM USE  MEM LIM  VERSION    IMAGE ID      CONTAINER ID
osd.2  storage1         stopped           4m ago  11d        -    40.9G  <unknown>  <unknown>     <unknown>
osd.3  storage1         running (11d)     4m ago  11d    8017M    40.9G  20.2.1     fb63cba66eea  34fb7a8a57c7
osd.4  storage2         running (11d)   118s ago  11d    6976M    42.9G  20.2.1     fb63cba66eea  2398d946309a
osd.5  storage2         running (11d)   118s ago  11d    8365M    42.9G  20.2.1     fb63cba66eea  1af495168fdb
```

### 5. SSH to the storage host

Connect to the host that owns the device:

```bash
ssh -i <private-key> <storage-host>
```

### 6. Zap the device

Install ceph-volume if it's not installed in the storage host:

```bash
apt install -y ceph-volume
```

:::warning
This need to run on the storage host of the device you are trying to zap. Given that the different hosts share the same name of the dives, you need to be very careful.
:::

```bash
ceph-volume lvm zap <device> --destroy
```

Replace `<device>` with the block device path (for example, `/dev/vdb`). This destroys the LVM structures and wipes the BlueStore label.

### 7. Remove the OSD daemon from the orchestrator

```bash
cephadm shell -- ceph orch daemon rm osd.<osd-id> --force
```

### 8. Purge the OSD from the cluster

```bash
cephadm shell -- ceph osd purge <osd-id> --yes-i-really-mean-it
```

### 9. Apply a raw per-device spec

Create a spec file for the device:

```yaml
service_type: osd
service_id: "raw-<hostname>-<device-basename>"
placement:
  hosts:
    - <hostname>
spec:
  data_devices:
    paths:
      - <device>
  method: raw
```

For example, for device `/dev/vdb` on host `storage0`:

```yaml
service_type: osd
service_id: "raw-storage0-vdb"
placement:
  hosts:
    - storage0
spec:
  data_devices:
    paths:
      - /dev/vdb
  method: raw
```

Apply it:

```bash
cephadm shell --mount /tmp/spec.yaml:/tmp/spec.yaml -- ceph orch apply -i /tmp/spec.yaml
```

The orchestrator will provision a new raw BlueStore OSD on the device and add it to the cluster. The cluster will rebalance data back onto it automatically.

### 10. Verify

```bash
cephadm shell -- ceph -s
cephadm shell -- ceph osd tree
cephadm shell -- ceph orch device ls --refresh
```

Confirm the new OSD is `up` and `in`, and the cluster returns to `HEALTH_OK` before migrating the next OSD.

## After All OSDs Are Migrated

Once every LVM OSD has been replaced, verify no LVM volumes remain:

```bash
cephadm shell -- ceph-volume lvm list
```

The output should be empty. Confirm all OSDs appear as individual `osd.raw-<host>-<device>` services:

```bash
cephadm shell -- ceph orch ls
```

Expected output:

```
NAME                  PORTS   RUNNING  REFRESHED  AGE  PLACEMENT
crash                             3/3  81s ago    12d  *
mgr                               2/2  81s ago    12d  count:2
mon                               3/5  81s ago    12d  count:5
osd.default                         0  -          12d  storage2
osd.raw-storage0-sdc                1  81s ago    5h   storage0
osd.raw-storage0-sdd                1  81s ago    4h   storage0
osd.raw-storage1-sdc                1  81s ago    3h   storage1
osd.raw-storage1-sdd                1  81s ago    2h   storage1
osd.raw-storage2-sdc                1  16s ago    87m  storage2
osd.raw-storage2-sdd                1  16s ago    22m  storage2
```

Finally, remove the legacy `osd.default` service:

```bash
cephadm shell -- ceph orch rm osd.default
```
