# CAPI Management Cluster

Cluster API (CAPI) runs in the management cluster and is used by OpenStack Magnum to provision tenant Kubernetes clusters.

This document describes how CAPI is deployed in the management cluster, how Magnum uses it as its backend driver, and what operators need to know to operate and troubleshoot this subsystem.

:::note

This change is transparent to end users. Users continue to create and manage tenant Kubernetes clusters through the IaaS Console in the same way as before.

:::

## Overview

[Cluster API (CAPI)](https://cluster-api.sigs.k8s.io/) is a Kubernetes sub-project that manages the lifecycle of Kubernetes clusters as native Kubernetes objects. It runs in the management cluster alongside other platform services (observability stack, IaaS Console, etc.).

When a user requests a Kubernetes cluster through the IaaS Console, the request goes through OpenStack Magnum, which uses CAPI as its backend driver. Magnum creates the corresponding CAPI objects (`Cluster`, `MachineDeployment`, etc.) in the management cluster. The CAPI controllers then reconcile those objects by calling the OpenStack API to provision the underlying infrastructure.

## Architecture

```
IaaS Console
     │
     ▼ (OpenStack Magnum API)
  Magnum
     │  creates/deletes Cluster objects via CAPI driver
     ▼
Management Cluster
     ├── capi-system                       — Core CAPI controller manager
     ├── capi-kubeadm-bootstrap-system     — Kubeadm bootstrap provider
     ├── capi-kubeadm-control-plane-system — Kubeadm control plane provider
     ├── capo-system                       — OpenStack infrastructure provider (CAPO)
     └── magnum-system                     — Tenant Cluster objects live here
           ├── Cluster/
           ├── Machine/
           ├── MachineDeployment/
           └── MachineSet/
```

The OpenStack infrastructure provider (CAPO) calls the OpenStack API to create the networks, security groups, and VMs that make up each tenant cluster.

## CAPI Providers

The following CAPI providers are installed on the management cluster:

| Provider | Version | Namespace | Purpose |
|---|---|---|---|
| CAPI core | v1.10.4 | `capi-system` | Reconciles `Cluster`, `Machine`, `MachineDeployment`, `MachineSet` objects |
| OpenStack (CAPO) | v0.11.8 | `capo-system` | Calls OpenStack API to provision infrastructure |
| Kubeadm bootstrap | bundled with core | `capi-kubeadm-bootstrap-system` | Generates bootstrap configs for nodes |
| Kubeadm control plane | bundled with core | `capi-kubeadm-control-plane-system` | Manages control plane lifecycle |

## Magnum CAPI Driver

Magnum is configured to use the CAPI driver instead of the legacy Heat driver. This is controlled by the `magnum.capi.enabled` flag in the release-assets inventory.

:::note

This configuration will be removed in future releases, meaning that using CAPI driver will be the only option.

:::

When enabled:

- Magnum creates CAPI `Cluster` objects in the `magnum-system` namespace instead of Heat stacks.
- The management cluster kubeconfig is provided to Magnum so it can interact with the CAPI API.
- Tenant cluster VMs are created directly by CAPO via the OpenStack API — there are no Heat stacks involved.

:::note

The Nova API microversion is pinned to **2.63** in Magnum's configuration. This is required by the CAPI driver: it needs soft-anti-affinity server groups (available from microversion 2.15), but the "policies" parameter format it uses breaks at microversion 2.64 and above.

:::

## Inspecting CAPI resources in the management cluster

You need `kubectl` access to the management cluster to inspect CAPI resources.

```bash
export KUBECONFIG=/path/to/management-cluster-kubeconfig
```

List all tenant clusters and their current phase:

```bash
kubectl get clusters,machines,machinedeployments,machinesets -n magnum-system
```

To get a tree view of a specific cluster:

```bash
clusterctl describe cluster <cluster-name> -n magnum-system
```

## Observability

Five Grafana alerts monitor the health and provisioning lifecycle of tenant clusters. They fire on the CAPI object state scraped from the management cluster via kube-state-metrics:

| Alert | Trigger |
|---|---|
| **CAPI Cluster in Failed Phase** | A `Cluster` object entered the `Failed` phase |
| **CAPI Machine in Failed Phase** | A `Machine` object entered the `Failed` phase |
| **CAPI MachineDeployment Degraded** | Ready replicas < desired replicas |
| **CAPI Cluster Stuck in Provisioning** | A `Cluster` has been provisioning for more than 30 minutes |
| **CAPI MachineSet Workers Not Ready** | Workers have not become ready for more than 30 minutes |

See [Observability Alerts](./OBSERVABILITY_ALERTS.md) for alert configuration and notification setup.

## Configuration

CAPI is deployed as part of the standard platform deployment. The deployment is handled by the `platform-setup.sh` script included in the release assets.

## Related Resources

- [CAPI Cluster Health Alerts runbook](./runbooks/CAPI_CLUSTER_HEALTH_ALERTS.md) — how to respond to CAPI alerts
- [Observability Alerts](./OBSERVABILITY_ALERTS.md) — full alert reference and notification setup
- [IaaS Console Configuration](./IAAS_CONSOLE_CONFIGURATION.md) — IaaS Console operator reference
