# Switch heartbeat alert

Responding to Switch Heartbeat Evaluation alerts caused by a hedgehog-agent crash loop

## Purpose

This runbook covers the `Switch Heartbeat Evaluation` Grafana alert, which fires when a leaf switch's hedgehog-agent stops sending heartbeats:

| Alert | Trigger |
|---|---|
| **Switch Heartbeat Evaluation** | `increase(fabric_agent_agent_heartbeats_total[6m]) + increase(fabric_agent_agent_config_apply_duration_seconds_count[6m])` is below 3 for every point in the last 12 minutes, or there is no data at all |

The alert evaluates samples by their timestamp, and the switch sets that timestamp with its own clock. A switch whose clock is behind real time fires this alert even though its agent is healthy and its metrics are being delivered. Always run [Step 0](#step-0-triage-find-out-which-scenario-applies) first: it tells the scenarios apart in one query.

The most common cause is a VNI conflict crash loop: after a tenant is deleted, the hedgehog-agent attempts to create a new tenant's VRF VNI before the switch has finished removing the old one. The agent receives a gNMI `InvalidArgument` error (`VNI is already used in VRF VrfV…-tf`) and restarts, hitting the same conflict on every reconciliation cycle.

The fix is to delete the newly created (offending) tenant so the agent can reconcile cleanly.

---

## Prerequisites Checklist

- [ ] Access to Grafana (to view the firing alert)
- [ ] Access to Loki (Grafana → Explore, Loki data source)
- [ ] Operator access to the iaas-api Swagger UI (`https://<iaas-api-host>/api/docs`)
- [ ] SSH access to `hedgehog0` and, through it, to the switches (for Scenarios B and C)

---

## Step 0: Triage: find out which scenario applies

In **Grafana → Explore**, select the **Prometheus** data source and run:

```
time() - max by (hostname) (max_over_time(timestamp(fabric_agent_agent_heartbeats_total)[3h:1m]))
```

The result is, per switch, how many seconds ago its newest heartbeat sample is stamped.

| Result | Meaning | Go to |
|---|---|---|
| Under ~120 seconds | Metrics are current, the agent itself is failing | [Step 1](#step-1-check-loki-for-errors) |
| Several minutes or more, and growing over time | The switch clock is behind real time | [Scenario C](#scenario-c-data-present-but-grafana-shows-a-persistent-time-lag) |
| No result for a switch | No metrics have arrived for 3 hours | [Scenario B](#scenario-b-no-data-in-prometheus-alert-fires-immediately) |

:::tip

Several switches lagging by different amounts at the same time points to a shared cause, most likely the NTP server on `hedgehog0` (see [C.2](#c2-check-the-ntp-server-on-hedgehog0)).

:::

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

Re-run the [Step 0](#step-0-triage-find-out-which-scenario-applies) query:

- **No data**: go to [Scenario B](#scenario-b-no-data-in-prometheus-alert-fires-immediately).
- **Data exists but is consistently behind real time**: go to [Scenario C](#scenario-c-data-present-but-grafana-shows-a-persistent-time-lag).
- **Data exists and is current**: collect the full ERROR output for further investigation:

```
{job="hedgehog-agent"} |= `ERROR`
```

### DELETE returns `404`

The tenant may have already been cleaned up automatically. Re-run the Loki query to check whether new errors have stopped — if they have, no further action is required.

### Alert does not clear after 10 minutes

Re-run the Loki query. If a new batch of `VNI is already used in` errors appears with a different VRF prefix, a second tenant creation has raced the same VNI. Repeat Steps 2–4 for the new prefix.

---

## Scenario B: No data in Prometheus (alert fires immediately)

**Symptom:** Searching for `fabric_agent_agent_heartbeats_total` in Prometheus returns no results at all. The alert fires as "No data".

### B.1 Check that Alloy is running on the switches

SSH to each switch (`172.30.0.7` and `172.30.0.8`) and run:

```bash
ps aux | grep alloy
```

You should see a line with `/opt/hedgehog/bin/alloy run ...`.

If the process is missing, start it manually. Alloy will not restart on its own if it stops:

```bash
sudo -u alloy /opt/hedgehog/bin/alloy run \
  --server.http.listen-addr=<switch-ip>:7043 \
  --cluster.enabled=false \
  --disable-reporting \
  --storage.path=/var/lib/alloy \
  /etc/sonic/hedgehog/config.alloy &
```

### B.2 Fix: restart CoreDNS on hedgehog0

If Alloy is running but metrics are still missing, restart CoreDNS on `hedgehog0`.

SSH to `hedgehog0` and run:

```bash
sudo kubectl --kubeconfig /etc/rancher/k3s/k3s.yaml -n kube-system rollout restart deployment/coredns
```

Wait 30 seconds for the new pod to become ready.

### B.3 Verify

In Grafana → Explore (Prometheus), run:

```
fabric_agent_agent_heartbeats_total
```

Results should appear within a few minutes. The alert clears within ~12 minutes.

:::note
Metrics from an outage longer than 2 hours will not be recovered.
:::

---

## Scenario C: Data present but Grafana shows a persistent time lag

**Symptom:** `fabric_agent_*` metrics exist in Prometheus, but the [Step 0](#step-0-triage-find-out-which-scenario-applies) query shows they are behind real time by minutes or tens of minutes, and the lag grows slowly. The switch agent is healthy and Alloy is delivering metrics: the samples are simply stamped with a wrong time.

The switches get their time from an NTP server (chrony) that runs as the `ntp` deployment in the `fab` namespace of the Hedgehog k3s cluster on `hedgehog0`, at `172.30.0.1`. When that server loses its upstream sources, the switch clocks drift freely, by about two minutes per day.

All commands in this scenario are read-only until [C.3](#c3-fix-restart-the-ntp-server).

### C.1 Check the switch clock and NTP status

SSH to each switch (`172.30.0.7` and `172.30.0.8`) and run:

```bash
date -u
timedatectl status | grep -E 'Local time|RTC time|synchronized'
ntpq -pn
```

Compare `date -u` with a correct clock. The clock is drifting if it is behind and `System clock synchronized: no`.

Then read the `ntpq -pn` line for `172.30.0.1`:

```
     remote           refid      st t when poll reach   delay   offset  jitter
==============================================================================
 172.30.0.1      216.239.35.0     2 u  269 1024    0    0.375  +613169   0.000
```

- **`reach` is `0`**: the switch has received no valid answer from the NTP server recently. Go to [C.2](#c2-check-the-ntp-server-on-hedgehog0).
- **`reach` is not `0` and `st` is `2` or `3`**: the server is fine. Go to [C.4](#c4-fallback-set-the-system-clock-from-the-hardware-clock).

:::note

`refid` and `offset` on this line keep the values of the last sample, even when that sample was rejected. Do not use them to judge the server's current health.

:::

### C.2 Check the NTP server on hedgehog0

SSH to `hedgehog0` and run:

```bash
K="sudo kubectl --kubeconfig /etc/rancher/k3s/k3s.yaml"
$K -n fab get pods -o wide | grep ntp
$K -n fab exec deploy/ntp -- chronyc -n sources
$K -n fab exec deploy/ntp -- chronyc tracking | grep -E 'Reference|Stratum|Leap'
$K -n fab exec deploy/ntp -- grep nameserver /etc/resolv.conf
```

The server is broken if `chronyc sources` lists no servers, or `chronyc tracking` shows `Stratum : 0` and `Leap status : Not synchronised`. A server in this state answers the switches with stratum 0 and leap 3, which the switches correctly reject.

A known cause is a stale DNS server in the pod. The pod uses host networking, but its `/etc/resolv.conf` is written once, when the pod is created. If the network or DNS of `hedgehog0` has changed since then, the `nameserver` line still shows the old address (for example `192.168.33.251` instead of the address in `hedgehog0`'s own `/etc/resolv.conf`). chrony then cannot resolve its upstream servers (`time.cloudflare.com`, `time1.google.com`, and so on) the next time it restarts, and it ends up with no sources.

### C.3 Fix: restart the NTP server

On `hedgehog0`, recreate the pod so it gets the current DNS configuration:

```bash
$K -n fab rollout restart deployment/ntp
$K -n fab rollout status deployment/ntp
```

Wait about 10 seconds, then confirm the server is synchronised:

```bash
$K -n fab exec deploy/ntp -- grep nameserver /etc/resolv.conf
$K -n fab exec deploy/ntp -- chronyc -n sources
$K -n fab exec deploy/ntp -- chronyc tracking | grep -E 'Reference|Stratum|Leap'
```

Expected: the current `nameserver`, several sources with one marked `^*`, `Stratum : 2`, and `Leap status : Normal`.

:::note

The pod log shows `Disabled control of system clock` and `Could not step system clock`. This is expected: the pod only serves time and never changes `hedgehog0`'s clock.

:::

No action is needed on the switches. ntpd on each switch corrects its own clock at its next poll of the server, which can take up to about 17 minutes (`poll 1024` seconds in `ntpq -pn`). The jump is logged in `/var/log/syslog`:

```
ntpd[11748]: CLOCK: time stepped by 1056.313337 second(s)
```

### C.4 Fallback: set the system clock from the hardware clock

Use this only if the NTP server is healthy and a switch still does not correct its clock after two poll intervals. Run on the affected switch:

```bash
timedatectl status | grep 'RTC time'
sudo hwclock --hctosys
date -u   # confirm the time jumped forward
```

:::warning

Check `RTC time` against a correct clock first. The hardware clock can also be off by several minutes, in which case this only corrects the switch partially. The fix also does not prevent new drift: without a working NTP server the clock drifts again.

:::

### C.5 Verify

Re-run the [Step 0](#step-0-triage-find-out-which-scenario-applies) query. The lag should drop below ~120 seconds right after the switch clock is corrected. The alert clears within ~12 minutes.

The metrics have a gap the size of the correction, because the clock jumped forward. No data is lost.
