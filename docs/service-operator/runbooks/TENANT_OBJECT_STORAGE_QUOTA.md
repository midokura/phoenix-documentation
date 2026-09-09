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
