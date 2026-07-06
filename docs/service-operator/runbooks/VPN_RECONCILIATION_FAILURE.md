---
sidebar_position: 13
---

# VPN Agent Reconciliation Failure

Responding to the `VPN Agent Reconciliation Failure` Grafana alert.

## Purpose

This alert fires when the `user-sync-agent` on a tenant VPN server has not completed a successful reconciliation cycle within the configured threshold — meaning it has repeatedly failed to fetch state from Swift, retrieve the private key from Barbican, or apply the WireGuard configuration.

The alert fires per tenant (labelled `iaas_tenant_id`). While the alert is active, newly added users will not get VPN access until the next successful reconciliation.

In most cases the cause is a transient error on an OpenStack backing service (Keystone or Swift) that resolves on its own within a few reconcile cycles. The alert is designed with an uptime grace period and configurable duration threshold to avoid noisy pages for these brief outages.

## Prerequisites

- SSH mido admin private key (`~/.ssh/infra`) on your local machine or `bastion0`
- OpenStack CLI access (local or on `bastion0`)

### SSH to VPN servers

VPN servers are accessible via `bastion0` as a ProxyJump host. From your local machine:

```bash
ssh -J ubuntu@bastion0 -i ~/.ssh/mido_infra ubuntu@<vpn-server-ip>
```

The `ubuntu` user has passwordless sudo on all VPN servers.

### OpenStack CLI

OpenStack commands can be run locally (if you have CLI and credentials configured) or from `bastion0` via the Ansible container:

```bash
cd ~/gpu-infrastructure && ./scripts/platform-setup.sh --shell

# Inside the container:
source <(ansible-vault view --vault-password-file /secrets/vault-key.txt /infra-management/config/admin-openrc.sh)
export OS_CACERT=/infra-management/config/certificates/ca/root.crt
```

All `openstack` commands in this runbook assume this shell.

---

## Step 1: Inspect the agent logs via Loki

The VPN server ships `user-sync-agent` logs to Loki via Alloy, labeled with `service_type=vpn-server` and the `tenant_id`. From **Grafana → Explore**, select **Loki** and run:

```
{service_type="vpn-server", tenant_id="<iaas_tenant_id>"} | json | __journal__syslog_identifier = "user-sync-agent"
```

Filter to the time window when the alert fired. Look for lines containing:

| Pattern                                  | Meaning                                                                              |
| ---------------------------------------- | ------------------------------------------------------------------------------------ |
| `Failed to fetch state`                  | The agent could not authenticate with Keystone or retrieve the state file from Swift |
| `Failed to fetch key from Barbican`      | The agent could not resolve or retrieve the private key secret from Barbican         |
| `No private key available`               | No private key source is configured (missing Barbican secret and no env var)         |
| `Failed to sync WireGuard configuration` | `wg syncconf` returned an error — WireGuard kernel module or interface issue         |
| `WireGuard configuration error`          | Could not read or write `/etc/wireguard/wg0.conf`                                    |
| `Fatal error`                            | The agent process itself crashed (exit 1)                                            |

### Transient error pattern

If you see error log lines followed by a successful reconciliation (e.g., `Configuration in sync`) within a few minutes, the incident was transient — a brief Keystone or Swift outage. No action needed.

### Persistent error pattern

If error lines repeat at the poll interval (default 60s) with no interspersed success lines, the issue is ongoing. Proceed to [Step 2](#step-2-ssh-into-the-vpn-server).

---

## Step 2: SSH into the VPN server

The VPN server is an OpenStack VM inside the affected tenant's project. SSH in as the `ubuntu` user:

```bash
ssh -J ubuntu@bastion0 -i ~/.ssh/mido_infra ubuntu@<vpn-server-ip>
```

If you do not have the VPN server IP, look it up via OpenStack:

```bash
openstack server list --all-projects --project <iaas_tenant_id> --name vpn-server
```

:::note

The SSH command above uses `bastion0` as a ProxyJump host, so no direct route to the tenant network is needed from your local machine — this works even if the VPN itself is the problem.

:::

---

## Step 3: Diagnose the failure

### 3.1 Check the agent service status

```bash
sudo systemctl status user-sync-agent
```

The service should be `active (running)`. If it is `failed`, the agent has crashed:

```bash
sudo journalctl -u user-sync-agent --since "10 minutes ago" --no-pager | tail -50
```

Look for `Fatal error:` lines and the traceback that follows.

If the service is `inactive (dead)`, first check the env file exists — the unit has a `ConditionPathExists` on it, so if it's missing the service silently skips startup:

```bash
sudo ls /etc/user-sync-agent.env
```

If the file is **missing**, the VPN server was not fully provisioned — the env file is written by the iaas-api at tenant creation time. Inform the user that the tenant was misprovisioned and needs to be recreated. Contact the platform team to delete and re-create the tenant.

If the file is **present**, start the service:

```bash
sudo systemctl start user-sync-agent
```

### 3.2 Check the agent environment

```bash
sudo cat /etc/user-sync-agent.env
```

Confirm the environment variables are present and look correct:

| Variable | Purpose | Expected format |
| ---------------------------------------- | ------------------------------------------- | ------------------------------------------------- |
| `KEYSTONE_AUTH_URL` | Keystone endpoint for auth | `https://<host>:5000/v3/auth/tokens` |
| `KEYSTONE_APPLICATION_CREDENTIAL_ID` | Application credential ID | 32-char hex string |
| `KEYSTONE_APPLICATION_CREDENTIAL_SECRET` | Application credential secret | Non-empty string |
| `STATE_FILE_URL` | Swift object storage URL for the state JSON | `https://<host>:8080/v1/AUTH_<project-id>/<tenant-id>/config/vpn-users.json` |
| `BARBICAN_SECRET_NAME` | Barbican secret name (alternative to `BARBICAN_SECRET_ID`) | `vpn-private-key-<tenant-id>` |
| `BARBICAN_SECRET_ID` | Barbican secret UUID (alternative to `BARBICAN_SECRET_NAME`) | UUID (`xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`) |
| `BARBICAN_ENDPOINT` | Barbican API endpoint | `https://<host>:9311` |
| `TENANT_ID` | Tenant identifier | Non-empty string |

Both the application credential (`vpn-credential-{TENANT_ID}`) and the Barbican secret (`vpn-private-key-{TENANT_ID}`) are created by the iaas-api during tenant provisioning.

If any variable is missing or malformed, proceed to [Keystone authentication failure](#keystone-authentication-failure) — the env file must be regenerated by re-provisioning the tenant.

### 3.3 Test connectivity to backing services from the VPN server

Start by sourcing the env file and authenticating with Keystone — this also gets the token needed for the Swift and Barbican checks:

```bash
source <(sudo cat /etc/user-sync-agent.env)
TOKEN=$(curl -s -X POST "$KEYSTONE_AUTH_URL" \
  -H "Content-Type: application/json" \
  -d '{"auth":{"identity":{"methods":["application_credential"],"application_credential":{"id":"'"$KEYSTONE_APPLICATION_CREDENTIAL_ID"'","secret":"'"$KEYSTONE_APPLICATION_CREDENTIAL_SECRET"'"}}}}' \
  -k -i | grep -i 'x-subject-token' | tr -d '\r' | awk '{print $2}')
echo "$TOKEN"
```

If `TOKEN` is empty, Keystone is unreachable or the application credential is invalid — see [Keystone authentication failure](#keystone-authentication-failure).

**Swift state file:**

```bash
curl -s "$STATE_FILE_URL" -H "X-Auth-Token: $TOKEN" -k | python3 -m json.tool | head -20
```

A 4xx/5xx or connection error indicates a Swift issue. An invalid JSON response means a corrupted state file. To inspect the object metadata from the Ansible container:

```bash
openstack object show <tenant_id> config/vpn-users.json
```

See [Swift state file failure](#swift-state-file-failure).

**Barbican secret:**

If the env file has `BARBICAN_SECRET_NAME`:

```bash
SECRET_REF=$(curl -s "$BARBICAN_ENDPOINT/v1/secrets?name=$BARBICAN_SECRET_NAME" \
  -H "X-Auth-Token: $TOKEN" -k | jq -r '.secrets[0].secret_ref // "NOT FOUND"')
curl -s "$SECRET_REF/payload" -H "X-Auth-Token: $TOKEN" -k
```

If the env file has `BARBICAN_SECRET_ID`:

```bash
curl -s "$BARBICAN_ENDPOINT/v1/secrets/$BARBICAN_SECRET_ID/payload" \
  -H "X-Auth-Token: $TOKEN" -k
```

An empty response or `404` means the secret is missing. A `403` means the application credential lacks Barbican access. The payload must be a non-empty WireGuard private key. See [Barbican key fetch failure](#barbican-key-fetch-failure).

### 3.4 Check the WireGuard interface

```bash
sudo wg show
```

If the command returns nothing or an error, the WireGuard interface `wg0` is down:

```bash
sudo systemctl status wg-quick@wg0
sudo systemctl start wg-quick@wg0
```

See [WireGuard interface or config failure](#wireguard-interface-or-config-failure).

---

## Step 4: Remediation by failure type

### Keystone authentication failure

The application credential may have expired or been revoked. From the Ansible container on `bastion0`:

```bash
openstack application credential list --user <service-account> | grep vpn-credential-<tenant_id>
```

If the credential is missing, it must be recreated through the iaas-api — the VPN VM's env file was generated at provisioning time and the credential is tied to the iaas service account. Contact the platform team to re-provision VPN infrastructure for the tenant.

### Swift state file failure

The state file is owned by the iaas-api and lives at `config/vpn-users.json` in the tenant's Swift bucket (`<tenant_id>`). Check its content from the Ansible container on `bastion0`:

```bash
openstack object save --file /tmp/vpn-users.json <tenant_id> config/vpn-users.json
python3 -m json.tool /tmp/vpn-users.json
```

If the Swift service is down, wait for it to recover — the agent will reconcile on the next cycle.

If the file is missing or corrupted, it must be restored through the iaas-api. The quickest way is to trigger any user change on the tenant (add or remove a user via the iaas-api), which rewrites the state file. If the bucket itself is missing, VPN infrastructure needs to be fully re-provisioned by removing and creating the tenant again via the iaas-api.

### Barbican key fetch failure

The secret is named `vpn-private-key-<tenant_id>` and was created by the iaas-api during tenant provisioning.

- **Secret not found:** It may have been deleted mid-rotation. See the [WireGuard key rotation runbook](key-rotation/VPN_WIREGUARD_KEYS.md) to verify and complete the rotation. If rotation was not in progress, options are:
  - Recreate the tenant (cleanest option, especially for recently provisioned tenants).
  - Recreate the private key: generate a new WireGuard keypair, store the private key in Barbican under the same name (`vpn-private-key-<tenant_id>`), then ask users to re-download their VPN configuration — they will receive the updated public key and peers will be updated on the next reconcile.
- **403 Forbidden:** The application credential `vpn-credential-<tenant_id>` lacks Barbican access. The platform team may need to update the Barbican RBAC policy for this project.
- **Barbican service unreachable:** Wait for Barbican to recover — the agent will pick it up on the next reconcile.

### WireGuard interface or config failure

If `wg show` reports the interface is down or missing:

```bash
sudo systemctl restart wg-quick@wg0
sudo wg show
```

If the config file is corrupted:

```bash
# Check permissions
ls -la /etc/wireguard/wg0.conf

# Inspect content
sudo cat /etc/wireguard/wg0.conf
```

The file must be owned by `root:root` with mode `0600` and contain a valid WireGuard `[Interface]` section with `PrivateKey`, `ListenPort`, and `Address`.
