# Observability Storage

Configuring storage backends for Prometheus metrics and Loki logs.

## Storage Backend

The storage backend is controlled by `phoenix_observability_storage` in your environment's `inventory.yml`:

| Value | Prometheus | Loki |
|-------|-----------|------|
| `"ceph"` _(default)_ | Cinder CSI PVC (`csi-cinder-sc-retain`) | Ceph RGW S3 |
| `"local"` | local-path (node disk) | local-path (node disk) |

```yaml
phoenix_observability_storage: "ceph"
```

### Prerequisites for `"ceph"`

- Ceph must be deployed and integrated with OpenStack (Cinder)
- `ceph_mon_hosts` and `ceph_rgw_hosts` must be defined in inventory

The Cinder CSI driver is automatically deployed on the management cluster when `phoenix_observability_storage: "ceph"` is set — no additional configuration required.

## Prometheus

### PVC Size

Controls the size of the Cinder PVC provisioned for Prometheus. Only applies when `phoenix_observability_storage: "ceph"`.

```yaml
prometheus_pvc_size: "150Gi"  # default
```

### Retention Period

How long Prometheus keeps metrics. Uses [Prometheus duration format](https://prometheus.io/docs/prometheus/latest/querying/basics/#time-durations) (`d`, `w`, `y` are supported).

```yaml
prometheus_retention_period: "30d"
```

If not set, the chart default applies (15 days).

## Loki

### Retention Period

How long Loki keeps logs. Uses [Go duration format](https://pkg.go.dev/time#ParseDuration) — only `h` (hours) and smaller units are supported (`d`, `w`, `y` are not valid).

```yaml
loki_retention_period: "8760h"   # 1 year
```

If not set, the chart default applies (7 days).

### S3 Bucket Configuration

When `phoenix_observability_storage: "ceph"`, Loki stores logs in a Ceph RGW S3 bucket. The RGW user and bucket are created automatically if they don't exist.

The defaults work for most deployments and should not be changed unless you have a specific reason. Override via `loki_ceph_s3` — specify only the keys you want to change:

```yaml
loki_ceph_s3:
  rgw_user: loki          # default
  bucket: lokilogs        # default
  rgw_port: 8080          # default
  bucket_quota_max_size: "1TiB"  # default; set to "" to disable
  # rgw_host auto-resolved from ceph_rgw_hosts[0].ip
```

| Key | Default | Description |
|-----|---------|-------------|
| `rgw_user` | `loki` | RGW user UID to create or reuse |
| `bucket` | `lokilogs` | S3 bucket name to create or reuse |
| `rgw_host` | _(auto from `ceph_rgw_hosts[0].ip`)_ | RGW endpoint reachable by Loki pods |
| `rgw_port` | `8080` | RGW endpoint port |
| `bucket_quota_max_size` | `1TiB` | Max bucket size quota. Set to `""` to disable. |

## Example

```yaml
# Full example for a production environment with Ceph
phoenix_observability_storage: "ceph"
prometheus_pvc_size: "150Gi"
prometheus_retention_period: "30d"
loki_retention_period: "8760h"   # 1 year

# Optional S3 overrides (all have safe defaults):
# loki_ceph_s3:
#   bucket_quota_max_size: "2TiB"
```

## Choosing a storage backend

`phoenix_observability_storage: "ceph"` is the recommended setting and the default. `"local"` is acceptable for short-lived or test environments where data loss on node failure is tolerable.

**Set the backend before the first deployment.** Changing it later requires manual intervention (see below).

## Migrating from `local` to `ceph`

Storage volumes cannot be changed in-place once created. To migrate an existing deployment:

1. Delete the existing Prometheus and Loki volumes (this will lose current metrics and log history):

```bash
kubectl delete pvc prometheus-server storage-loki-0 -n observability
```

2. Set `phoenix_observability_storage: "ceph"` in your inventory.

3. Run the platform setup to redeploy observability with Ceph-backed storage:

```bash
./scripts/platform-setup.sh --update
```

New volumes will be created automatically on the next deployment.
