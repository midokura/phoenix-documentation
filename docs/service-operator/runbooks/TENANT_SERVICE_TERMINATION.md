# Tenant service termination — data disposal procedure

Complete operational procedure for removing all data associated with a tenant upon service termination.

## Purpose

This runbook defines the procedure for terminating a tenant's service and ensuring all associated data is fully removed. The primary mechanism is the `DELETE /api/tenants/{tenant_id}` API endpoint, which orchestrates deletion of all tenant resources in the correct order.

:::important

This procedure is **irreversible**. Once executed, all tenant data — including VMs, storage, networking, logs, backups, and credentials — is permanently removed with no recovery path.

:::

---

## Data categories covered

| Category | Mechanism | Notes |
|---|---|---|
| Virtual machines & baremetal nodes | API — explicit per-resource delete | |
| Networking (routers, floating IPs, security groups, networks) | API — explicit per-resource delete | Management router interfaces detached first |
| VPN storage bucket (configs, server certificate, cryptographic keys) | API — entire S3/Swift bucket deleted | |
| Ceph object storage (RGW user) | API — RGW user and all associated data deleted | |
| DNS zone | API — Designate zone deleted | Only if DNS is configured for the tenant |
| Cinder volumes, snapshots, backups | OpenStack — auto-removed by project deletion | |
| OpenStack application credentials | OpenStack — auto-removed by project deletion | |
| Grafana monitoring dashboard | API — dashboard deleted via Grafana API | |
| Loki logs | API — delete request submitted to Loki | Asynchronous; compactor processes in background |
| HedgeHog VPCs | API — tenant VPCs removed via HedgeHog client | |
| Database record | API — tenant and user-tenant mappings deleted | |

---

## Prerequisites Checklist

- [ ] Operator-scoped API credentials for the iaas-api (Google OAuth or Keystone token)
- [ ] The `tenant_id` UUID of the tenant to terminate (obtain from the operator panel or `GET /api/tenants`)
- [ ] Confirmed with the account team that the tenant has been notified and the termination is authorised
- [ ] OpenStack CLI configured for the target environment
- [ ] `jq` installed locally

---

## Step 1: Identify the tenant

```bash
curl -s -H "Authorization: Bearer <token>" \
  https://<iaas-api-host>/api/tenants | jq '.[] | select(.name == "<tenant-name>")'
```

**Expected output:** A single tenant object. Copy the `id` value — this is your `<tenant_id>` for all subsequent steps.

---

## Step 2: Execute service termination

```bash
curl -s -o /dev/null -w "%{http_code}" \
  -X DELETE \
  -H "Authorization: Bearer <token>" \
  https://<iaas-api-host>/api/tenants/<tenant_id>
```

**Expected output:** `204`

**If you receive `409`:** The tenant has active Kubernetes clusters. Delete them first via the operator panel, then retry.

:::note

Loki log deletion is asynchronous — the API submits a delete request for the tenant's log stream and Loki's compactor processes it in the background. All other data is removed synchronously before the `204` is returned.

:::

---

## Step 3: Verify full data disposal

Run the following script to verify all data categories have been removed. Set the three variables at the top before running.

```bash
#!/usr/bin/env bash
set -euo pipefail

TENANT_ID="<tenant_id>"
IAAS_API_HOST="<iaas-api-host>"
LOKI_HOST="<loki-host>"
TOKEN="<token>"

PASS=0; FAIL=0

check() {
  local label="$1"; local result="$2"; local expected="$3"
  if [ "$result" = "$expected" ]; then
    echo "  ✓ $label"
    ((PASS++)) || true
  else
    echo "  ✗ $label (got: $result, expected: $expected)"
    ((FAIL++)) || true
  fi
}

echo "=== Tenant data disposal verification: $TENANT_ID ==="
echo

echo "--- API ---"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer $TOKEN" \
  "https://$IAAS_API_HOST/api/tenants/$TENANT_ID")
check "Tenant record deleted" "$STATUS" "404"

echo "--- OpenStack ---"
PROJECT=$(openstack project show "$TENANT_ID" -f value -c id 2>/dev/null || echo "not_found")
check "OpenStack project deleted" "$PROJECT" "not_found"

VM_COUNT=$(openstack server list --all-projects --project "$TENANT_ID" -f value 2>/dev/null | wc -l | tr -d ' ')
check "VMs deleted" "$VM_COUNT" "0"

NET_COUNT=$(openstack network list --project "$TENANT_ID" -f value 2>/dev/null | wc -l | tr -d ' ')
check "Networks deleted" "$NET_COUNT" "0"

echo "--- Loki ---"
LOG_COUNT=$(curl -s -G "http://$LOKI_HOST/loki/api/v1/query" \
  --data-urlencode "query={tenant_id=\"$TENANT_ID\"}" \
  --data-urlencode "limit=1" | jq '.data.result | length')
check "Loki logs purged" "$LOG_COUNT" "0"

echo
echo "=== Result: $PASS passed, $FAIL failed ==="
[ "$FAIL" -eq 0 ] || exit 1
```

:::note

If the Loki check fails immediately after termination, wait a few minutes for the compactor to process the delete request and re-run the script. The 7-day retention policy (`retention_period: 168h`) also ensures any remaining log data expires automatically.

:::

---

## ✓ Done

All tenant data has been removed once the verification script reports `0 failed`.

---

## Troubleshooting

### OpenStack project still exists after deletion

```bash
openstack project delete <tenant_id>
```

### VPN storage bucket not deleted

Delete the bucket manually via the Ceph RGW admin API or S3 client, targeting the bucket named after the tenant ID.

### Loki logs still present after 30 minutes

Verify that Loki's compactor is running and that `deletion_mode` is set to `filter-and-delete` in the `phoenix-observability` Helm chart values. Check compactor logs for errors.

### Grafana dashboard still visible

```bash
curl -X DELETE \
  -H "Authorization: Bearer <grafana-token>" \
  https://<grafana-host>/api/dashboards/uid/<tenant_id>
```
