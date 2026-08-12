# pgpool stuck on wrong primary after PostgreSQL HA failover

Recovering from pgpool refusing database connections after a PostgreSQL HA failover is cancelled mid-flight.

## Purpose

This runbook covers the situation where pgpool loses track of which PostgreSQL node is the primary after a transient network disruption causes a failover to start and then automatically cancel. The result is that pgpool refuses all connections from iaas-api, making IaaS Console fully inoperative.

The `IaaS API Error Rate High (> 0.1%)` alert will be firing during this incident.

---

## Background

The IaaS Console database stack is `postgresql-ha`, which bundles:

- **PostgreSQL** — two nodes (primary + standby) with streaming replication
- **pgpool** — a connection pooler and failover coordinator that sits between iaas-api and the PostgreSQL nodes

When a temporary network partition occurs, pgpool may begin a failover and then abort it when connectivity is restored. In this partial-failover state, pgpool's internal view of which node is primary becomes inconsistent with reality. It then rejects all new connections with the error `kind does not match between main(0) slot[0]` and iaas-api loses all database access.

---

## Prerequisites

- `kubectl` access to the management cluster with `KUBECONFIG` set
- Access to Grafana / Loki for the affected environment

---

## Step 1: Confirm the diagnosis

### 1.1 Check the IaaS API Error Rate alert

In Grafana, confirm the **IaaS API Error Rate High (> 0.1%)** alert is firing and that errors started suddenly (consistent with a point-in-time event).

### 1.2 Inspect pgpool logs in Loki

In **Grafana → Explore**, select **Loki** and run:

```
{service_name="postgresql-ha"} |= "ERROR"
```

Filter to the time window around the incident start. The following log patterns indicate pgpool is in a bad state:

| Log pattern | Meaning |
|---|---|
| `kind does not match between main(0) slot[0]` | pgpool is confused about which node is primary — this is the key indicator |
| `ERROR: unable to read message kind` | pgpool cannot communicate with the node it thinks is primary |
| `ERROR: unable to read data from DB node` | Same root cause, different code path |
| `ERROR: recovery is in progress` | pgpool is querying a standby node as if it were primary |
| `sr_check_worker … ERROR: Failed to check replication time lag` | Streaming replication health check failing |
| `unable to determine if server is in recovery` | pgpool cannot classify nodes correctly |

If you see a burst of these errors at the same timestamp across multiple log lines, pgpool is the problem. Proceed to [Step 2](#step-2-verify-no-active-write-operations).

If errors are scattered and non-repeating, this may be a transient network blip — wait a few minutes and recheck before proceeding.

### 1.3 Confirm iaas-api cannot connect

```bash
kubectl logs -n iaas-console deploy/iaas-api --tail=50 | grep -i "connection\|database\|db\|error"
```

You should see repeated connection failures from iaas-api toward pgpool.

---

## Step 2: Verify no active write operations

:::warning

Restarting pgpool carries a risk of losing in-flight database writes. You must confirm no write operations are in progress before proceeding.

:::

In **Grafana → Explore**, select **Loki** and run:

```
{service_name="iaas-api"} |~ "(PUT|POST)"
```

Set the time range to the **last 5 minutes**. If this query returns no log lines, there are no active write operations and it is safe to restart pgpool.

If you see recent PUT or POST log lines, wait for those operations to complete (or time out) before restarting.

---

## Step 3: Restart pgpool

Run the following from the deployment shell (`deployment0.phoenix.<location>`) or any host with `kubectl` access to the management cluster:

```bash
kubectl rollout restart deployment iaas-api-postgresql-ha-pgpool -n iaas-console
```

Monitor the rollout:

```bash
kubectl rollout status deployment iaas-api-postgresql-ha-pgpool -n iaas-console
```

**Expected output:**
```
Waiting for deployment "iaas-api-postgresql-ha-pgpool" rollout to finish: 0 of 1 updated replicas are available...
deployment "iaas-api-postgresql-ha-pgpool" successfully rolled out
```

---

## Step 4: Confirm recovery

### 4.1 Check iaas-api logs

```bash
kubectl logs -n iaas-console deploy/iaas-api --tail=50 | grep -i "connection\|database\|error"
```

Connection errors should stop appearing after the pgpool pod is ready.

### 4.2 Confirm the alert has cleared

In Grafana, navigate to **Alerting → Alert rules**, search for **IaaS API Error Rate High**, and confirm the state has returned to **Normal**.

:::tip

The error rate metric is computed over a rolling window. Allow 2–5 minutes after the fix for the alert to fully resolve.

:::

---

## Troubleshooting

### pgpool pod restarts but errors continue

The PostgreSQL primary may have changed or there may be a replication lag that pgpool cannot resolve on its own. Check the PostgreSQL pod status:

```bash
kubectl get pods -n iaas-console -l app.kubernetes.io/component=postgresql
```

Then inspect the logs of the primary PostgreSQL pod:

```bash
kubectl logs -n iaas-console <postgresql-primary-pod> --tail=100
```

If the PostgreSQL nodes themselves are unhealthy (e.g. both in standby mode), the issue is in the Patroni/replication layer rather than pgpool — escalate to the platform team.

### pgpool rollout hangs

If `kubectl rollout status` does not complete within 5 minutes:

```bash
kubectl describe pod -n iaas-console -l app.kubernetes.io/component=pgpool
```

Look at the `Events` section for scheduling or image pull errors. If the pod is in `Pending`, check node resource availability:

```bash
kubectl get nodes
kubectl describe node <node-name>
```

### Alert re-fires shortly after recovery

A recurring network issue may be causing repeated partial failovers. Investigate Hedgehog / SONiC instability on the affected environment and work with the network team to address the root cause before the next restart.
