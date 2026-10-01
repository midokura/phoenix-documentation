# IaaS Login System Failure

Responding to `IaaS Login System Failure` alerts caused by a broken OAuth callback

## Purpose

This runbook covers the `IaaS Login System Failure` Grafana alert, which fires when the IaaS Console OAuth callback fails — meaning users are unable to log in.

| Alert | Trigger |
|---|---|
| **IaaS Login System Failure** | `iaas_login_errors_total{reason="callback_failed"}` increases in the last 15 minutes |

This alert fires only on **system failures** in the OAuth flow (network errors, provider outages, misconfigured secrets). It does **not** fire for unauthorized access attempts (a user not provisioned in the system), which are handled via support.

---

## Prerequisites Checklist

- [ ] Access to Grafana (to view the firing alert and its labels)
- [ ] Access to Loki (Grafana → Explore, Loki data source)
- [ ] `kubectl` access to the cluster

---

## Step 1: Identify the provider

Open the firing alert in Grafana and check the `provider` label: **google** or **azure**.

This tells you which OAuth integration is broken and where to focus the investigation.

---

## Step 2: Check iaas-api logs for the exception

In **Grafana → Explore**, select the **Loki** data source and run:

```
{app="iaas-api"} |= "callback error"
```

The log entry will contain the full exception. Common patterns:

| Log message | Likely cause |
|---|---|
| `Connection refused` / `timeout` | Network issue between iaas-api and the OAuth provider |
| `invalid_grant` / `invalid_client` | OAuth client secret is wrong or expired |
| `redirect_uri_mismatch` | Redirect URI in the OAuth app config doesn't match the deployed environment |
| `SSLError` / `certificate verify failed` | TLS issue on the network path to the provider |

---

## Step 3: Resolve by cause

### Network / connectivity issue

1. Check if Google (`accounts.google.com`) or Microsoft (`login.microsoftonline.com`) is reachable from the iaas-api pod:

   ```bash
   kubectl exec -n iaas-console deploy/iaas-api -- curl -sf https://accounts.google.com > /dev/null && echo OK
   ```

2. If unreachable, check whether a recent network or firewall change was applied. Escalate to the infrastructure team if the egress path is blocked.

3. Check the provider's status page:
   - Google: https://www.google.com/appsstatus
   - Microsoft: https://status.azure.com

### Expired or invalid OAuth client secret

1. Locate the Kubernetes secret used by iaas-api (check `values-<site>.yaml` for the secret name, typically `iaas-api-oauth-secrets`).

2. Verify the secret exists and is not empty:

   ```bash
   kubectl get secret iaas-api-oauth-secrets -n iaas-console -o jsonpath='{.data}' | base64 -d
   ```

3. If the secret has expired, rotate it in the OAuth provider's developer console and update the Kubernetes secret. Restart the iaas-api pod to pick up the new value:

   ```bash
   kubectl rollout restart deploy/iaas-api -n iaas-console
   ```

### Redirect URI mismatch

1. The log will state the configured redirect URI. Verify it matches the URI registered in the Google Cloud Console or Azure App Registration for this environment.

2. If mismatched, update the OAuth app's allowed redirect URIs to include the correct value.

---

## Step 4: Verify recovery

Once the fix is applied, confirm login works by attempting a login in the IaaS Console UI.

Then confirm the alert clears in Grafana (**Alerting → Alert rules → IaaS Login System Failure** → state returns to **Normal**). Allow up to one scrape interval (1 minute) for the state to update.

---

## ✓ Done

The alert has cleared and login succeeds end-to-end.

---

## Troubleshooting

### Alert fires but logs show `not authorized in system`

This is an `unauthorized` event, not a system failure — a user authenticated with OAuth successfully but their email is not provisioned in the IaaS system. The alert should not have fired for this; check whether the `reason` label on the metric is `callback_failed`. If it is `unauthorized`, this is a data issue — ask the user to contact support to get their account provisioned.

### Alert clears but users still report login failures

The OAuth callback may be succeeding but the user is not provisioned. Search Loki for:

```
{app="iaas-api"} |= "not authorized in system"
```

This will show the email of the affected user. Add them to the system via the admin panel.
