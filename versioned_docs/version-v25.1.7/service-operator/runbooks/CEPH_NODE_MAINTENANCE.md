# Ceph node maintenance

Safe procedure for taking a Ceph storage node offline and returning it to service

## Purpose

Describes how to safely remove a storage node from the Ceph cluster for maintenance (hardware work, OS update, reboot) and restore it to full service without data loss.

---

## Prerequisites Checklist

- [ ] SSH access to any Ceph monitor node (`ceph_mon_hosts` in inventory)
- [ ] Cluster is in `HEALTH_OK` state (verified in Step 1)
- [ ] At least 2 other storage nodes are healthy and reachable (never drain the last healthy node)

All `ceph` commands in this runbook must be run inside a `cephadm shell`. Connect to any monitor node and enter the shell before starting:

```bash
ssh <ceph-node>
sudo cephadm shell
```

---

## Step 1: Verify cluster health

```bash
ceph health detail
```

**Expected output:** `HEALTH_OK`

Do not proceed if the cluster is `HEALTH_WARN` or `HEALTH_ERR` — resolve existing issues first.

---

## Step 2: Remove the node from the RADOS Gateway placement

Before making any changes, record the current RGW placement so you can restore it exactly in Step 8:

```bash
ceph orch ls rgw
```

Note the host list from the `PLACEMENT` column and the port from the `PORTS` column — you will need both when re-adding the node.

Verify the RGW daemon is running on the target node:

```bash
ceph orch ps <hostname> --daemon-type rgw
```

If no entry is present, skip to Step 3.

Update the placement spec to exclude the target node. Replace `<count>` with the current number of RGW nodes minus one, and list only the remaining hosts:

```bash
ceph orch apply rgw gateway --placement="<count> <remaining-host-1> <remaining-host-2>" --port=8080
```

Confirm the daemon has stopped on the target node:

```bash
ceph orch ps <hostname> --daemon-type rgw
```

**Expected output:** no output.

:::warning

If the daemon does not disappear within a few minutes, you can force the gateway to reconcile its placement by restarting it:

```bash
ceph orch restart rgw.gateway
```

This will reset any live S3/Swift connections in flight.

:::

---

## Step 3: Enter maintenance mode

```bash
ceph orch host maintenance enter <hostname>
```

This stops cephadm from scheduling new daemons on the node and signals the cluster to account for the node going offline.

:::warning

When a storage node goes offline, the cluster begins rebalancing data across the remaining OSDs. With `osd_replication: 2` and three nodes, some data will temporarily have only one copy during this window. Rebalancing time scales with data volume — for large clusters it can take tens of minutes or more.

If the maintenance window is very short and you want to prevent rebalancing, set the `noout` flag before entering maintenance mode:

```bash
ceph osd set noout
```

Remember to unset it after the node is back online and before verifying cluster health:

```bash
ceph osd unset noout
```

Do not leave `noout` set for longer than necessary — it suppresses the cluster's ability to recover from a genuine OSD failure. See [OSD flags reference](#osd-flags-reference) for additional flags that can reduce load on the remaining nodes during maintenance.

:::

---

## Step 4: Verify all daemons have stopped

```bash
watch 'ceph orch ps <hostname>'
```

Wait until the output is empty — no daemons listed for that hostname. Do not proceed to maintenance while any daemon is still running. Press `Ctrl+C` to exit `watch`.

---

## Step 5: Perform maintenance

Reboot, replace hardware, apply OS updates, or perform whatever work is needed. The remaining nodes continue serving the cluster.

---

## Step 6: Exit maintenance mode

Once the node is back online and reachable via SSH:

```bash
ceph orch host maintenance exit <hostname>
```

cephadm will automatically reschedule daemons. Verify they are running:

```bash
ceph orch ps <hostname>
```

**Expected output:** monitor, OSD, and other daemons appear with status `running`.

Check whether any OSD flags are set:

```bash
ceph osd dump | grep ^flags
```

If you set flags in Step 3, unset them before verifying cluster health. For example:

```bash
ceph osd unset noout
```

For the full list of flags and their unset commands, see [OSD flags reference](#osd-flags-reference).

---

## Step 7: Verify cluster health

```bash
ceph health detail
```

Wait for `HEALTH_OK` before proceeding. If the cluster reports `HEALTH_WARN` with `X osds down`, allow a few minutes for OSD recovery after the node restarts.

---

## Step 8: Re-add the node to the RADOS Gateway

Apply the full gateway placement including the restored node, using the same port as initial setup:

```bash
ceph orch apply rgw gateway --placement="<count> <hostname-1> <hostname-2> <hostname-3>" --port=8080
```

Replace `<count>` with the total number of RGW nodes and list all hostnames including the restored one. Verify:

```bash
ceph orch ps --daemon-type rgw
```

**Expected output:** an `rgw` daemon running on each host in the placement.

---

## Troubleshooting

### Node does not exit maintenance mode

Check whether cephadm can still reach the node:

```bash
ceph cephadm check-host <hostname>
```

If the node is unreachable, confirm it is up and SSH from the monitor node works before retrying. If the orchestrator is stuck, force a refresh and retry:

```bash
ceph orch refresh
```

### OSDs do not come back after maintenance exit

Allow 2–3 minutes, then check OSD status:

```bash
ceph osd tree
```

Any OSD still marked `down` can be restarted individually:

```bash
ceph orch daemon restart osd.<id>
```

If an OSD remains `down` after a restart, inspect its logs:

```bash
ceph orch daemon logs osd.<id>
```

### Cluster stuck in `HEALTH_WARN` after node returns

Confirm no OSD flags were left set (see [OSD flags reference](#osd-flags-reference)), then watch recovery:

```bash
ceph -w
```

### Node fails to rejoin — suspected hardware failure

1. Unset any OSD flags set before maintenance (see [OSD flags reference](#osd-flags-reference)) so the cluster can begin rebalancing and protect data redundancy.
2. If the node was re-added to RGW in Step 8, remove it again following Step 2.
3. For hardware replacement and OSD re-addition, follow the provisioning procedure in [CEPH_SETUP](../CEPH_SETUP).

:::warning
With `osd_replication: 2` and three nodes, losing a node reduces some PGs to a single copy until rebalancing completes or a replacement is added. Restore a third node before any further failures occur.
:::

### RGW daemon does not appear after Step 8

Force the orchestrator to reconcile:

```bash
ceph orch restart rgw.gateway
```

If it still does not appear, verify the placement spec matches the expected host list and port:

```bash
ceph orch ls rgw
```

---

## OSD flags reference

The following flags can be set before entering maintenance mode to control cluster behavior during the window. Set and unset them from inside a `cephadm shell`.

| Flag | Effect | When to use |
|---|---|---|
| `noout` | Prevents OSDs from being marked out when they go offline | Any planned maintenance; prevents unnecessary rebalancing |
| `nobackfill` | Prevents backfilling of data to OSDs | Extended maintenance where you want no data movement |
| `norebalance` | Prevents rebalancing even if OSDs are already marked out | Use alongside `noout` for complete suppression of data movement |
| `noscrub` | Pauses regular scrubbing across the cluster | Reduces I/O load on remaining nodes during maintenance |
| `nodeep-scrub` | Pauses deep scrubbing across the cluster | Reduces I/O load; safe to set during any maintenance window |

For a short planned reboot, `noout` alone is usually sufficient. For hardware replacement or extended downtime, combining `noout` + `nobackfill` + `norebalance` + `noscrub` + `nodeep-scrub` gives complete control over cluster activity.

Always unset all flags after the node is back online:

```bash
ceph osd unset noout
ceph osd unset nobackfill
ceph osd unset norebalance
ceph osd unset noscrub
ceph osd unset nodeep-scrub
```

Verify no flags remain set:

```bash
ceph osd dump | grep ^flags
```
