# Migrating LVM OSDs to Raw BlueStore

Migrate default os to custom raw spec

## Purpose

Older clusters provisioned OSDs via `ceph orch daemon add osd --method raw`, which internally used LVM. These OSDs are not directly manageable by the orchestrator as individual devices. This section describes how to safely migrate them to raw BlueStore specs.

> **This is a destructive, data-moving operation.** Each OSD must be decommissioned (data backfilled away) before the disk is wiped and reprovisioned. The cluster stays online throughout, but each OSD migration triggers a full rebalance cycle — budget significant time for large clusters.

### Prerequisites

- Cluster is `HEALTH_OK` before starting
- Replication factor ≥ 2 (data remains available while one OSD is out)
- You have identified which OSDs are LVM-backed

**Identify LVM-backed OSDs:**

```bash
cephadm shell -- ceph-volume lvm list
```

Each entry shows an OSD ID and the device it occupies. Note the OSD ID (`osd.<n>`) and the underlying block device.

### Migration Procedure (per OSD)

Repeat this sequence for each LVM OSD, **one at a time**.

#### 1. Mark the OSD out

```bash
cephadm shell -- ceph osd out <osd-id>
```

This tells the cluster to stop using the OSD and begin backfilling its data to remaining OSDs.

#### 2. Wait for the cluster to finish rebalancing

```bash
watch cephadm shell -- ceph -s
```

Wait until `health: HEALTH_OK` and `0 degraded` / `0 misplaced` before proceeding. **Do not continue if the cluster is not fully recovered** — proceeding while degraded risks data loss.

#### 3. Stop and remove the OSD daemon

```bash
cephadm shell -- ceph orch daemon rm osd.<osd-id> --force
```

#### 4. Purge the OSD from the cluster

```bash
cephadm shell -- ceph osd purge <osd-id> --yes-i-really-mean-it
```

This removes the OSD from the CRUSH map and cluster maps.

#### 5. Zap the device

```bash
cephadm shell -- ceph-volume lvm zap <device> --destroy
```

Replace `<device>` with the block device path (e.g. `/dev/vdb`). This destroys the LVM structures and wipes the BlueStore label.

#### 6. Apply a raw per-device spec

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

For example, for device `/dev/vdb` in host `storage0` it would be:

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
cephadm shell --mount /path/to/spec.yaml:/tmp/spec.yaml -- ceph orch apply -i /tmp/spec.yaml
```

The orchestrator will provision a new raw BlueStore OSD on the device and add it to the cluster. The cluster will rebalance data back onto it automatically.

#### 7. Verify

```bash
cephadm shell -- ceph -s
cephadm shell -- ceph osd tree
```

Confirm the new OSD is `up` and `in`, and the cluster returns to `HEALTH_OK` before migrating the next OSD.

### After All OSDs Are Migrated

Once every LVM OSD has been replaced, verify no LVM volumes remain:

```bash
cephadm shell -- ceph-volume lvm list
```

The output should be empty. All OSDs should now appear in `ceph orch ls` as individual `osd.raw-<host>-<device>` services.
