# Neutron L3 agent recovery

Responding to the Neutron Service Availability Degraded alert caused by a dead or stuck neutron-l3-agent

## Purpose

This runbook covers the `Neutron Service Availability Degraded` Grafana alert:

| Alert | Trigger |
|---|---|
| **Neutron Service Availability Degraded** | `neutron_agent_state{agent_type="L3 agent"} == 0` for any agent |

:::note

The alert query may show more firing series than there are failing agents. Each `openstack-exporter` instance scrapes the same Neutron API VIP and adds its own `instance` label, so one failing agent on one node appears as three series.

:::

The typical failure chain:

1. A RabbitMQ node enters maintenance mode (`CONNECTION_FORCED - Node was put into maintenance mode`), causing the neutron-l3-agent on that control node to lose its AMQP connection and stop sending heartbeats — Neutron marks it `alive=False`.
2. After reconnecting, the agent process dies inside its container. With no restart policy configured, the container stays running but hollow (wrapper script alive, agent dead) and Neutron keeps reporting it as `alive=False`.
3. When the container is restarted manually, `neutron-netns-cleanup` hangs trying to tear down existing `qrouter-*` namespaces whose `keepalived` or `radvd` processes did not exit cleanly. The agent never starts.

The fix is to pre-clean the namespaces from the host so `neutron-netns-cleanup` exits immediately on the next start.

---

## Prerequisites Checklist

- [ ] SSH access to the affected control node(s) with `sudo` privileges
- [ ] Grafana access to confirm which control nodes are reporting a dead agent

---

## Step 1: Identify the affected nodes

In Grafana, inspect the firing alert and note which `host` label values appear in the failing series. Typically one or two control nodes (e.g. `control1`, `control2`).

You can also check directly on a control node:

```bash
sudo podman ps --filter "name=neutron_l3_agent" --format "{{.Names}}\t{{.Status}}"
```

A stuck or dead agent will show a status other than `Up … (healthy)`.

---

## Step 2: Run the recovery script

Copy the script below to the affected node and run it as root. Repeat on each affected node.

```bash
#!/usr/bin/env bash
# Recover a stuck/dead neutron-l3-agent on the current node.
# Usage: sudo bash neutron-l3-recover.sh

set -euo pipefail

CONTAINER=neutron_l3_agent
WAIT_SECS=90

info() { printf '[INFO]  %s\n' "$*"; }
die()  { printf '[ERROR] %s\n' "$*" >&2; exit 1; }

[[ $EUID -eq 0 ]] || die "Must run as root (sudo bash $0)"

# 1. Stop the container — kills any stuck neutron-netns-cleanup process
info "Stopping $CONTAINER..."
podman stop "$CONTAINER" 2>/dev/null || true

# 2. Pre-clean qrouter namespaces so neutron-netns-cleanup exits instantly on restart
info "Cleaning qrouter network namespaces..."
mapfile -t NS_LIST < <(ip netns list 2>/dev/null | awk '/^qrouter/{print $1}')

if [[ ${#NS_LIST[@]} -eq 0 ]]; then
    info "No qrouter namespaces found."
else
    for ns in "${NS_LIST[@]}"; do
        info "  Removing $ns"
        ip netns pids "$ns" 2>/dev/null | xargs -r kill -9 2>/dev/null || true
        ip netns delete "$ns" 2>/dev/null || true
    done
    info "Removed ${#NS_LIST[@]} namespace(s)."
fi

# 3. Start the container
info "Starting $CONTAINER..."
podman start "$CONTAINER"

# 4. Poll the container health check until healthy or timeout
info "Waiting up to ${WAIT_SECS}s for container to become healthy..."
deadline=$(( SECONDS + WAIT_SECS ))
status="unknown"
while (( SECONDS < deadline )); do
    sleep 5
    status=$(podman inspect --format '{{.State.Health.Status}}' "$CONTAINER" 2>/dev/null || echo "unknown")
    info "  health=$status"
    [[ "$status" == "healthy" ]] && break
done

[[ "$status" == "healthy" ]] || die "Container did not become healthy within ${WAIT_SECS}s. Check: podman logs $CONTAINER"

info "Container is healthy. Recovery complete."
podman ps --filter "name=^${CONTAINER}$"
```

**Expected output (success):**

```
[INFO]  Stopping neutron_l3_agent...
[INFO]  Removing qrouter-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
[INFO]  Removed 4 namespace(s).
[INFO]  Starting neutron_l3_agent...
[INFO]  Waiting up to 90s for container to become healthy...
[INFO]    health=starting
[INFO]    health=healthy
[INFO]  Container is healthy. Recovery complete.
```

---

## ✓ Done

The container is healthy on all affected nodes and the Grafana alert has cleared.

---

## Follow-up actions

- **Add a restart policy** to prevent agents from staying silently dead for hours. Set `kolla_container_restart_policy: always` in `infra-management/<install>/globals.yml` and apply with `reconfigure-openstack`.
- **Investigate the RabbitMQ maintenance event** — confirm whether it was intentional and, if so, add a post-maintenance health-check step to the relevant change-management runbook.

---

## Troubleshooting

### Script times out at the health check step

The container started but the agent is not passing its health check. Inspect the logs:

```bash
sudo podman logs --tail 100 neutron_l3_agent
```

If `neutron-netns-cleanup` is still running, there may be additional namespace types (`qdhcp-*`, `fip-*`) that need the same treatment. List all Neutron namespaces and repeat the cleanup:

```bash
sudo ip netns list | grep -E '^(qrouter|qdhcp|fip)-'
```

### Container exits immediately after start

Check for a misconfiguration or missing config file:

```bash
sudo podman inspect neutron_l3_agent | python3 -m json.tool | grep -A5 '"ExitCode"'
sudo podman logs neutron_l3_agent
```

### Alert does not clear after container is healthy

Allow up to 2 minutes for the openstack-exporter scrape cycle to pick up the recovered agent state. If it does not clear, verify the agent is registered on the Neutron side from a node that has OpenStack CLI access:

```bash
source /etc/kolla/admin-openrc.sh
openstack network agent list --agent-type l3
```
