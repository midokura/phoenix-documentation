# Cluster Add-ons

Monitoring health of Cluster Add-ons and performing maintenance tasks.

This guide provides instructions for operators to monitor the health of the Cluster Add-ons feature and perform manual maintenance tasks.

## Overview

Cluster Add-ons (such as JupyterHub and KubeRay) are pre-configured and hardcoded into the IaaS API. This ensures a stable and validated set of tools is available to all users. While the catalog itself is not configurable by operators, you are responsible for monitoring the deployment success and performing cleanup if an installation becomes stuck.

## Add-on Constraints and Requirements

Each add-on in the hardcoded catalog includes specific requirements that must be met for a successful installation and operation:

- **Kubernetes Version Compatibility**: The API validates the cluster's version against a version constraint (for example, `>=1.28`). If the cluster version does not satisfy this requirement, the installation will fail with a `400 Bad Request` error.
- **Resource Allocations**: Users configure resource limits (such as CPU and Memory) for certain add-ons via parameters. As this is a self-service feature, users are responsible for ensuring their cluster has adequate capacity. However, if an installation fails due to insufficient resources, an operator may need to assist in debugging the failure or informing the user about the capacity constraints of their specific cluster nodes.
- **Network Endpoints and Security Groups**: Add-ons expose services via specific ports defined in the catalog. To ensure these are accessible to users, the cluster's security groups and network policies must be configured to allow traffic on the relevant ports (for example, port 80 for JupyterHub, port 8265 for the KubeRay dashboard).

## Monitoring

### vLLM Dashboard (Model Provider)

For clusters running the `model-provider` addon, use the **AI Assistant Metrics** dashboard in Grafana to monitor the vLLM inference engine. The dashboard provides:

- **Requests Running / Waiting**: Current queue depth and active inference requests.
- **Inference Latency (p50/p90/p99)**: End-to-end latency percentiles per model.

The dashboard is included with the `phoenix-observability` stack. Search for **AI Assistant Metrics** in Grafana to find it.

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
- **Operation**: The `operation` key indicates the action performed (for example, `install`, `status`, `uninstall`).
- **Outcome**: Duration and success/failure details.

## Maintenance and Cleanup

### Manual Cleanup of Stuck Releases

If a release becomes stuck or cannot be deleted via the API, an operator can manually clean it up using `kubectl` on the tenant cluster:

1. **Identify the namespace**: Managed add-ons are installed in namespaces following the pattern `iaas-addon-{instance-name}`, where the instance name is the full addon name returned by the API (for example, `jupyterhub-x7k2`).
2. **Delete the HelmRelease**:

   ```bash
   kubectl delete helmrelease -n iaas-addon-jupyterhub-x7k2 jupyterhub-x7k2
   ```

3. **Delete the Namespace**:

   ```bash
   kubectl delete namespace iaas-addon-jupyterhub-x7k2
   ```

### Model Provider PVC Lifecycle

The `model-provider` add-on creates a dedicated **ReadWriteOnce PVC** for each deployed model to store model weights. These PVCs are provisioned from the `block-cinder` StorageClass by default.

- One PVC is created per model at install time. The size is fixed per model (for example, `60Gi` for Qwen3.5 35B, `40Gi` for Kimi VL A3B, `10Gi` for Qwen3.5 4B).
- **On uninstall, PVCs are deleted** along with all other add-on resources. Model weights stored in the PVC are not preserved between installs.
- Because PVCs are `ReadWriteOnce`, each model replica is scheduled on a single node. Multi-node inference is not supported for a single model instance.

If an uninstall gets stuck and PVCs remain orphaned, clean them up using the instance namespace (the namespace follows the pattern `iaas-addon-<instance-name>`, for example `iaas-addon-model-provider-x7k2`):

```bash
# Verify what will be deleted before removing
kubectl get pvc -n iaas-addon-<instance-name>
kubectl delete pvc --all -n iaas-addon-<instance-name>
```
