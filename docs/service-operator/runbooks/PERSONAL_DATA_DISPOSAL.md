# Personal data disposal procedure

Procedure for removing personal data from all platform locations upon an individual user deletion (GDPR right-to-erasure request).

## Personal data stored by this platform

The platform stores **email addresses only** as personal data — used solely for user authentication. No other personally identifiable information is collected or processed.

| Location | Data | Mechanism |
|---|---|---|
| PostgreSQL `user` table | Email address, role | Explicit deletion via API |
| VPN configuration (S3/Swift) | User public key mapped to email-based user ID | Explicit deletion via API |
| OpenStack application credentials | Associated with tenant project (not directly with email) | Auto-removed when project is deleted |
| System logs (Loki) | No email addresses logged as of iaas-console v2.x+ | Log retention policy enforced by `phoenix-observability` |
| PostgreSQL encrypted backups (S3) | Full DB dump includes `user` table | Pruned by retention policy; manual purge procedure below |

:::note

System logs did previously contain email addresses in auth middleware warnings. This was remediated in iaas-console — versions prior to the fix may have logs containing email addresses, which will expire according to the Loki retention policy configured in `phoenix-observability`.

:::

---

## Individual user deletion (GDPR erasure request)

Use this procedure when a specific user requests deletion of their personal data.

:::important

Backup purge does not happen on the same day as the deletion request. GDPR permits a short processing delay for backup cleanup. The procedure below ensures at least one clean backup (without the user's data) exists before any backup purge is executed.

:::

### Prerequisites

- [ ] Operator-scoped API credentials for the iaas-api
- [ ] The `user_id` UUID of the user to delete (obtain from the operator panel or `GET /api/users`)
- [ ] Access to the Kubernetes cluster to run the prune job if needed before the next scheduled backup
- [ ] `kubectl` configured for the target environment

### Step 1 — Remove the user from the database

```bash
curl -s -o /dev/null -w "%{http_code}" \
  -X DELETE \
  -H "Authorization: Bearer <token>" \
  https://<iaas-api-host>/api/users/<user_id>
```

**Expected output:** `204`

This call removes:
- The user's email address from the PostgreSQL `user` table
- The user's VPN configuration from all tenants they were assigned to

### Step 2 — Wait for the next clean backup

The daily backup CronJob runs at **02:00 UTC**. Wait for the next run to complete — the resulting backup will contain no trace of the deleted user.

To confirm the backup completed successfully:

```bash
kubectl get jobs -n iaas-console -l component=backup --sort-by=.metadata.creationTimestamp | tail -3
```

### Step 3 — Purge old backups

Once a clean backup exists, run the prune script to delete all older backups that contained the user's email. The most recent backup (the clean one) is always preserved.

```bash
kubectl run prune-backups --rm -it --restart=Never \
  --image=ghcr.io/midokura/iaas-backup:<version> \
  --env="S3_ENDPOINT=<s3-endpoint>" \
  --env="KEYSTONE_URL=<keystone-url>" \
  --env="ADMIN_PASS=<admin-password>" \
  --env="RETENTION_DAYS=1" \
  -- /scripts/utils/prune-s3-backups.sh
```

**`RETENTION_DAYS=1`** deletes all objects older than 1 day, keeping only the most recent clean backup. `S3_BUCKET` defaults to `backup` and can be omitted unless your deployment uses a different bucket name.

### Step 4 — Verify

```bash
# Confirm user record is gone
curl -s -H "Authorization: Bearer <token>" \
  https://<iaas-api-host>/api/users | jq '[.[] | select(.id == "<user_id>")] | length'
# Expected: 0
```

---

## Log retention

System logs are retained according to the policy configured in `phoenix-observability`. Email addresses are not present in logs as of iaas-console v2.x+. Logs expire automatically at the end of the configured retention period without manual intervention.

See `phoenix-observability` configuration for the current retention period.
