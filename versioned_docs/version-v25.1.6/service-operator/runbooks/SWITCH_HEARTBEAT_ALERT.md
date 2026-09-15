# Switch heartbeat alert

Responding to Switch Heartbeat Evaluation alerts caused by a hedgehog-agent crash loop

## Purpose

This runbook covers the `Switch Heartbeat Evaluation` Grafana alert, which fires when a leaf switch's hedgehog-agent stops sending heartbeats:

| Alert | Trigger |
|---|---|
| **Switch Heartbeat Evaluation** | `increase(fabric_agent_agent_heartbeats_total[3m])` is below 3 |

The most common cause is a VNI conflict crash loop: after a tenant is deleted, the hedgehog-agent attempts to create a new tenant's VRF VNI before the switch has finished removing the old one. The agent receives a gNMI `InvalidArgument` error (`VNI is already used in VRF VrfV…-tf`) and restarts, hitting the same conflict on every reconciliation cycle.

The fix is to delete the newly created (offending) tenant so the agent can reconcile cleanly.

---

## Prerequisites Checklist

- [ ] Access to Grafana (to view the firing alert)
- [ ] Access to Loki (Grafana → Explore, Loki data source)
- [ ] Operator access to the iaas-api Swagger UI (`https://<iaas-api-host>/api/docs`)

---

## Step 1: Check Loki for errors

Navigate to **Grafana → Explore**, select the **Loki** data source, and run:

```
{job="hedgehog-agent"} |= `ERROR`
```

If error lines are present, refine the query to isolate the VNI conflict pattern:

```
{job="hedgehog-agent"} |= `VNI is already used in` or `ERROR`
```

**If you see log lines containing `VNI is already used in`**, proceed to [Step 2](#step-2-identify-the-offending-tenant). Otherwise see [Troubleshooting](#troubleshooting).

---

## Step 2: Identify the offending tenant

### 2.1 Open log context

Click on one of the `VNI is already used in` log lines to expand it, then click **Show context**.

### 2.2 Find the preceding "Create VRF VNI" line

The context view is sorted newest-first, so the debug line you need sits **just below** the highlighted ERROR entry (it has a slightly earlier timestamp). It will read:

```
level=DEBUG … summary="Create VRF VNI VrfV<prefix>-tf" command=update …
```

**Example:**
```
level=DEBUG msg=Action idx=22 weight=15 summary="Create VRF VNI VrfV56aa9814-tf" command=update path="/sonic-vrf/VRF/VRF_LIST[vrf_name=VrfV56aa9814-tf]/vni"
```

This `VrfV<prefix>-tf` name identifies the newly created tenant. Note the hex prefix (the portion between `VrfV` and `-tf` — for example, `56aa9814`).

---

## Step 3: Find the new tenant

Navigate to:

```
https://<iaas-api-host>/api/docs#/tenants/list_tenants_tenants_get
```

Authorize if prompted, then execute **GET /tenants**. In the response, find the tenant whose `id` **starts with** the hex prefix from Step 2.2. Use your browser's page search (Ctrl+F / ⌘F) to locate the prefix quickly.

:::warning

Before proceeding, confirm this tenant has the most recent `created_at` timestamp among all results — it should be the newest tenant, created shortly before the alert fired.

:::

Copy its `id` (a UUID such as `56aa9814-xxxx-xxxx-xxxx-xxxxxxxxxxxx`).

---

## Step 4: Delete the new tenant

Navigate to:

```
https://<iaas-api-host>/api/docs#/tenants/delete_tenant_tenants__tenant_id__delete
```

Execute `DELETE /tenants/{tenant_id}` using the `id` copied in Step 3.

**Expected response:** `204 No Content`

---

## Step 5: Monitor for recovery

Allow up to 10 minutes for the hedgehog-agent to recover and the alert to clear.

### 5.1 Confirm errors have stopped

Re-run the Loki query from Step 1:

```
{job="hedgehog-agent"} |= `VNI is already used in` or `ERROR`
```

New error lines should stop appearing within a few minutes of the deletion.

### 5.2 Confirm the alert has cleared

In Grafana, navigate to **Alerting → Alert rules**, search for **Switch Heartbeat Evaluation**, and confirm the state has returned to **Normal**.

:::note

The `fabric_agent_agent_heartbeats_total` metric updates on every Prometheus scrape interval. Allow up to 2 minutes after the agent recovers for the alert to transition out of Firing.

:::

If errors continue after 10 minutes, repeat the investigation from [Step 1](#step-1-check-loki-for-errors) — a second VNI conflict may have occurred with a different tenant.

---

## ✓ Done

The alert has cleared and no new `VNI is already used in` errors appear in Loki.

---

## Troubleshooting

### No `VNI is already used in` errors in Loki

The heartbeat failure has a different root cause. Collect the full ERROR output for further investigation:

```
{job="hedgehog-agent"} |= `ERROR`
```

### DELETE returns `404`

The tenant may have already been cleaned up automatically. Re-run the Loki query to check whether new errors have stopped — if they have, no further action is required.

### Alert does not clear after 10 minutes

Re-run the Loki query. If a new batch of `VNI is already used in` errors appears with a different VRF prefix, a second tenant creation has raced the same VNI. Repeat Steps 2–4 for the new prefix.
