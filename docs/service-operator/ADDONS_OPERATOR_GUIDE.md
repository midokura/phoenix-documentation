# Operator Guide — Cluster Add-ons

This guide provides instructions for operators to monitor the health of the Cluster Add-ons feature and perform manual maintenance tasks.

## Overview

Cluster Add-ons (such as JupyterHub and KubeRay) are pre-configured and hardcoded into the IaaS API. This ensures a stable and validated set of tools is available to all users. While the catalog itself is not configurable by operators, you are responsible for monitoring the deployment success and performing cleanup if an installation becomes stuck.

## Add-on Constraints and Requirements

Each add-on in the hardcoded catalog includes specific requirements that must be met for a successful installation and operation:

- **Kubernetes Version Compatibility**: The API validates the cluster's version against a version constraint (e.g., `>=1.28`). If the cluster version does not satisfy this requirement, the installation will fail with a `400 Bad Request` error.
- **Resource Allocations**: Users configure resource limits (such as CPU and Memory) for certain add-ons via parameters. As this is a self-service feature, users are responsible for ensuring their cluster has adequate capacity. However, if an installation fails due to insufficient resources, an operator may need to assist in debugging the failure or informing the user about the capacity constraints of their specific cluster nodes.
- **Network Endpoints & Security Groups**: Add-ons expose services via specific ports defined in the catalog. To ensure these are accessible to users, the cluster's security groups and network policies must be configured to allow traffic on the relevant ports (e.g., port 80 for JupyterHub, port 8265 for the KubeRay dashboard).

## Monitoring

### Prometheus Metrics

The Cluster Add-ons feature exposes metrics through both the Flux controllers on the tenant clusters and the IaaS API itself.

#### Flux Metrics (from tenant cluster)

- `gotk_reconcile_duration_seconds{kind="HelmRelease"}`: Time taken for reconciliation.
- `gotk_reconcile_condition{kind="HelmRelease", type="Ready"}`: Success rate of releases (`status="True"` for healthy).

#### IaaS API Metrics

- `iaas_addon_api_duration_seconds{operation, status}`: Latency for API requests to manage add-ons.
- `iaas_addon_api_total{operation, status}`: Total count of add-on operations.
- `iaas_addon_api_errors_total{error_type}`: Error frequency by type (e.g., `validation-error`, `k8s-api-error`).

### Structured Logs

All add-on operations are logged by the IaaS API with structured JSON details, including:

- **Request ID**: Linking API calls to K8s operations.
- **Cluster/Add-on ID**: Identifiers for the target cluster and add-on type.
- **Operation**: The `operation` key indicates the action performed (e.g., `install`, `status`, `uninstall`).
- **Outcome**: Duration and success/failure details.

## Maintenance and Cleanup

### Manual Cleanup of Stuck Releases

If a release becomes stuck or cannot be deleted via the API, an operator can manually clean it up using `kubectl` on the tenant cluster:

1. **Identify the namespace**: Managed add-ons are installed in namespaces following the pattern `iaas-addon-{name}`.
2. **Delete the HelmRelease**:

   ```bash
   kubectl delete helmrelease -n iaas-addon-jupyterhub-x7k2 jupyterhub-x7k2
   ```

3. **Delete the Namespace**:

   ```bash
   kubectl delete namespace iaas-addon-jupyterhub-x7k2
   ```
