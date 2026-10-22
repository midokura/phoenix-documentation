# IaaS Login System Failure

Recover from a broken OAuth login flow in the IaaS Console

---

## Prerequisites Checklist

- [ ] Access to Grafana (to view the firing alert and its `provider` label)
- [ ] Access to Loki (Grafana → Explore, Loki data source)
- [ ] `kubectl` access to the cluster

---

## Step 1: Identify the provider and find the exception

Open the firing alert in Grafana and note the `provider` label value (`google` or `azure`).

Then go to **Grafana → Explore**, select **Loki**, and run:

```logql
{namespace="iaas-console", app="iaas-api"} |= "callback error" | line_format "{{.message}}"
```

You will see a log line like:

```
OAuth callback error
Traceback (most recent call last):
  ...
httpx.ConnectTimeout: [Errno 110] Connection timed out
```

Note the exception class and message — this determines which step to follow.

---

## Step 2: Act on the exception

### Connection error / timeout

**Symptoms:** `ConnectTimeout`, `ConnectionRefused`, `SSLError`, `ReadTimeout`

The iaas-api pod cannot reach the OAuth provider. Test connectivity from inside the pod (the container has no `curl` — use Python):

```bash
# For Google
kubectl exec -n iaas-console deploy/iaas-api -- \
  python3 -c "import urllib.request; urllib.request.urlopen('https://accounts.google.com', timeout=5); print('OK')"

# For Azure
kubectl exec -n iaas-console deploy/iaas-api -- \
  python3 -c "import urllib.request; urllib.request.urlopen('https://login.microsoftonline.com', timeout=5); print('OK')"
```

**If `FAIL`:** egress is blocked. Check whether a recent network or firewall change was applied — escalate to the infrastructure team.

**If `OK`:** the provider had a transient outage. Check their status page and monitor for recurrence:
- Google: https://www.google.com/appsstatus
- Microsoft: https://status.azure.com

---

### Invalid client / expired secret

**Symptoms:** `invalid_client`, `invalid_grant`, `unauthorized_client`, `401`

The OAuth client secret stored in Kubernetes is wrong or has expired.

OAuth credentials are stored in the `iaas-api-secrets` Kubernetes secret (mounted via `envFrom`). Check whether the relevant key is set:

```bash
# For Google
kubectl get secret iaas-api-secrets -n iaas-console \
  -o jsonpath='{.data.GOOGLE_CLIENT_SECRET}' | base64 -d | wc -c

# For Azure
kubectl get secret iaas-api-secrets -n iaas-console \
  -o jsonpath='{.data.AZURE_CLIENT_SECRET}' | base64 -d | wc -c
```

**Expected:** non-zero. Zero or an error means the secret is missing or empty.

If the secret needs updating, patch it and restart the pod:

```bash
# Replace <new-value> with the new secret from the provider console
kubectl patch secret iaas-api-secrets -n iaas-console \
  --type=merge -p "{\"data\":{\"GOOGLE_CLIENT_SECRET\":\"$(echo -n '<new-value>' | base64 -w0)\"}}"

kubectl rollout restart deploy/iaas-api -n iaas-console
kubectl rollout status deploy/iaas-api -n iaas-console
```

---

### Redirect URI mismatch

**Symptoms:** `redirect_uri_mismatch`, `invalid_redirect_uri`

The redirect URI configured in the OAuth provider app does not match what the pod is sending. The log line will include the mismatched URI:

```
redirect_uri_mismatch: The redirect URI in the request did not match a registered redirect URI.
```

Find what URI the pod is configured to send:

```bash
kubectl exec -n iaas-console deploy/iaas-api -- \
  env | grep -E "REDIRECT_URI|GOOGLE_REDIRECT|AZURE_REDIRECT"
```

Update the allowed redirect URIs in:
- **Google:** Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client
- **Azure:** Azure Portal → App Registrations → Authentication → Redirect URIs

Add the URI printed above. No pod restart needed — this is a provider-side change.

---

## Step 3: Verify recovery

Attempt a login in the IaaS Console UI and confirm it succeeds end-to-end.

Then confirm the alert clears in Grafana — **Alerting → Alert rules → IaaS Login System Failure** — state returns to **Normal** within one minute.

---

## ✓ Done

---

## Troubleshooting

### No log lines found in Loki

The alert may have fired on a very brief spike already resolved, or the pod restarted and logs are gone. Check recent pod restarts:

```bash
kubectl get pods -n iaas-console -l app=iaas-api
kubectl describe pod -n iaas-console -l app=iaas-api | grep -A5 "Last State"
```

If the pod restarted, check previous container logs:

```logql
{namespace="iaas-console", app="iaas-api"} |= "callback error"
```

Set the Loki time range to cover the alert firing time.

### Alert fires but logs show `not authorized in system`

This is a different metric label (`reason="unauthorized"`) and should not have triggered this alert. A user authenticated with OAuth successfully but is not provisioned in the system — no system fix needed. Ask the user to contact support to get their account added.

### `kubectl rollout restart` does not clear the error

The new pod may be pulling a cached image. Force a fresh rollout:

```bash
kubectl rollout restart deploy/iaas-api -n iaas-console
kubectl rollout status deploy/iaas-api -n iaas-console --timeout=120s
```

Then retest login.
