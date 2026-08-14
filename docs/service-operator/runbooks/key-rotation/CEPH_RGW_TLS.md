# Rotate Ceph RGW TLS Certificate

This runbook rotates the self-signed TLS certificate used by the Ceph RADOS Gateway (RGW). The certificate secures S3-compatible object storage access and is required when `ceph_rgw_tls_enabled: true` is set in inventory.

**Rotation cadence:** every 24 months. Rotation must complete before the `notAfter` date on `assets/ceph/rgw-tls.crt`.

**Affected environments:** ISYS, TYO (any environment with `ceph_rgw_tls_enabled: true`).

**Downtime:** none — cephadm performs a rolling RGW daemon redeploy, replacing one daemon at a time.

## Prerequisites

- [ ] VPN access to the target environment
- [ ] Ansible Vault password for the target environment
- [ ] The gpu-infrastructure repository checked out locally
- [ ] Write access to phoenix-inventories

## Step 1 — Check the current expiry

Read the expiry date from the committed certificate:

```bash
openssl x509 -in /path/to/phoenix-inventories/<env>/assets/ceph/rgw-tls.crt \
  -noout -subject -enddate
```

Or check what the cluster is actually serving (from a host with VPN access):

```bash
echo | openssl s_client -connect <ceph_rgw_tls_cn>:8080 2>/dev/null \
  | openssl x509 -noout -subject -enddate
```

Proceed if the certificate is within 60 days of expiry, or immediately if triggered by an incident.

## Step 2 — Generate a new certificate

From the gpu-infrastructure repository root, run the environment-specific script:

```bash
# ISYS
./scripts/generate-rgw-tls.isys.sh /path/to/phoenix-inventories/isys/assets

# TYO
./scripts/generate-rgw-tls.tyo.sh /path/to/phoenix-inventories/tyo/assets
```

The script prompts for the Vault password and overwrites the existing files:

| File | Description |
|------|-------------|
| `assets/ceph/rgw-tls.crt` | New public certificate — commit as-is |
| `assets/ceph/rgw-tls.key` | New vault-encrypted private key — commit |
| `assets/config/certificates/ca/ceph-rgw.crt` | Updated CA copy for Kolla container trust — commit |

Verify the new certificate has the expected SANs and validity:

```bash
openssl x509 -in /path/to/phoenix-inventories/<env>/assets/ceph/rgw-tls.crt \
  -noout -text | grep -A5 "Subject Alternative Name"
```

## Step 3 — Commit and upload the new certificate

Commit to phoenix-inventories:

```bash
cd /path/to/phoenix-inventories

# ISYS
git add isys/assets/ceph/ isys/assets/config/certificates/ca/ceph-rgw.crt
# TYO
git add tyo/assets/ceph/ tyo/assets/config/certificates/ca/ceph-rgw.crt

git commit -m "chore(<env>): rotate RGW TLS certificate"
git push
```

Then upload the new files to the bastion. The bastion expects them under `release-assets/assets/`, which is the directory mounted as `/infra-management` inside the Ansible container:

```bash
scp /path/to/phoenix-inventories/<env>/assets/ceph/rgw-tls.crt \
    <bastion>:~/release-assets/assets/ceph/
scp /path/to/phoenix-inventories/<env>/assets/ceph/rgw-tls.key \
    <bastion>:~/release-assets/assets/ceph/
scp /path/to/phoenix-inventories/<env>/assets/config/certificates/ca/ceph-rgw.crt \
    <bastion>:~/release-assets/assets/config/certificates/ca/
```

## Step 4 — Apply the new certificate

From the bastion, re-run the provisioning playbook with the `ceph_rgw_tls` tag:

```bash
./scripts/platform-setup.sh --provision-ceph --tags ceph_rgw_tls
```

The playbook reads the new cert and key from assets, applies an updated cephadm RGW service spec, and triggers a rolling daemon redeploy. The redeploy only runs if the spec changed — confirm it shows `changed` in the Ansible output.

## Step 5 — Verify

Confirm the cluster is now serving the new certificate:

```bash
echo | openssl s_client -connect <ceph_rgw_tls_cn>:8080 2>/dev/null \
  | openssl x509 -noout -subject -enddate
```

Checklist:

- [ ] `notBefore` matches today
- [ ] `notAfter` is ~730 days in the future
- [ ] S3 operations succeed (e.g. `aws s3 ls --endpoint-url https://<ceph_rgw_tls_cn>:8080`)
- [ ] No RGW daemons stuck restarting — run from any storage node:
  ```bash
  sudo cephadm shell -- ceph orch ps --daemon-type rgw
  ```

## Rollback

The pre-rotation files are the ones committed in git before Step 3. If the playbook fails or S3 access regresses:

1. Restore the previous certificate from git:

   ```bash
   cd /path/to/phoenix-inventories
   git revert HEAD
   git push
   ```

2. Re-upload the old files to the bastion — the bastion still holds the new cert from Step 3 and the playbook reads from there, not from git:

   ```bash
   scp -v /path/to/phoenix-inventories/<env>/assets/ceph/rgw-tls.crt \
       <bastion>:~/release-assets/assets/ceph/
   scp -v /path/to/phoenix-inventories/<env>/assets/ceph/rgw-tls.key \
       <bastion>:~/release-assets/assets/ceph/
   scp -v /path/to/phoenix-inventories/<env>/assets/config/certificates/ca/ceph-rgw.crt \
       <bastion>:~/release-assets/assets/config/certificates/ca/
   ```

3. Re-run the playbook to push the old certificate back into cephadm:

   ```bash
   ./scripts/platform-setup.sh --provision-ceph --tags ceph_rgw_tls
   ```

4. Re-verify with the `openssl s_client` check from Step 5 — the `notAfter` date should match the pre-rotation value.
