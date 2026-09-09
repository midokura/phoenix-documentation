# Tenant object storage quota management

Setting and inspecting object storage user quotas for IaaS Console tenants

## Setting quota

Object storage quotas are managed through the `/api/tenants/{tenant_id}/quota` API endpoint.

**Requires:** operator-scoped token

```bash
TENANT_ID=<tenant_id>
QUOTA_GB=100   # use -1 for unlimited

curl -s -X PUT \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"objectStorageGigabytes\": $QUOTA_GB}" \
  https://<iaas-api>/api/tenants/$TENANT_ID/quota
```

All fields are optional and independent: omitted fields are left unchanged. At least one must be present.

| Field | Unit | Description |
|---|---|---|
| `objectStorageGigabytes` | GB | (Optional) RGW user quota |
| `blockStorageGigabytes` | GB | (Optional) Cinder volume quota |
| `instances` | count | (Optional) Nova VM instances |
| `vcpus` | count | (Optional) vCPUs |
| `ram` | MB | (Optional) RAM |

Use `-1` for any field to set it to unlimited.

---

## Verifying the quota

As a member of the tenant, query the iaas-api `usage` endpoint:

**Requires:** tenant-scoped token

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  https://<iaas-api>/api/storage/usage \
  | jq '{usedBytes: .objectStorageUsedBytes, quotaBytes: .objectStorageQuotaBytes}'
```

---

## Annex: finding the RGW user for a tenant

The IaaS Console tenant ID is used as the OpenStack project **name**. The OpenStack project **ID** (a different UUID) is what RGW uses as the UID base.

| IaaS Console tenant ID | OpenStack project name | OpenStack project ID | RGW user UID |
|---|---|---|---|
| `<tenant_id>` | `<tenant_id>` | `<project_id>` | `<project_id>$<project_id>` |

RGW exposes the project name as `display_name` on the implicit user. To find which RGW user corresponds to a given tenant ID, scan all users for a matching `display_name`:

```bash
for uid in $(radosgw-admin user list | jq -r '.[]'); do
  display=$(radosgw-admin user info --uid "$uid" 2>/dev/null | jq -r .display_name)
  echo "$uid -> $display"
done
```

The entry whose `display_name` matches your tenant ID is the correct RGW user. To confirm the quota is applied, check the `user_quota` field:

```bash
radosgw-admin user info --uid '<project_id>$<project_id>' | jq .user_quota
```

Expected output when a 40 TiB quota is set:

```json
{
  "enabled": true,
  "check_on_raw": false,
  "max_size": 43980465111040,
  "max_size_kb": 42949672960,
  "max_objects": -1
}
```

`enabled: true` confirms the quota is active. `max_objects: -1` means no object count limit.

