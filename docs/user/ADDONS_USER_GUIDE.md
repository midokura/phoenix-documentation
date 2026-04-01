# Cluster Add-ons

Using Cluster add-ons to install and manage tools on Kubernetes clusters.

Cluster add-ons allow you to easily install and manage popular tools such as JupyterHub and KubeRay on your Kubernetes clusters through the IaaS Console UI.

## Introduction

Managing complex software on Kubernetes often requires dealing with Helm charts and technical configurations. The Cluster Add-ons feature simplifies this by providing a curated catalog of pre-configured tools that can be installed with just a few clicks.

## Installing an Add-on

To install an add-on on your cluster:

1. **Navigate to the Clusters section** in the IaaS Console.
2. **Select the cluster** where you want to install the add-on.
3. **Open the Add-ons tab**.
4. **Click "Install Add-on"** and choose a tool from the catalog (e.g., JupyterHub).
5. **Configure optional parameters** if available (such as CPU or Memory limits).
6. **Confirm the installation**.

The status will initially show as `pending-install` while the system provisions the necessary resources.

## Monitoring Status

Once an installation has started, you can track its progress in the Add-ons tab:

- **Pending Install**: The system is currently deploying the software. This typically takes 2–5 minutes.
- **Deployed**: The add-on is ready. An access URL (e.g., for the JupyterHub Web UI) will be provided in the interface.
- **Failed**: The installation encountered an error. You can click on the status to see a detailed error message.

## Uninstalling an Add-on

To remove an add-on:

1. Locate the add-on instance in the **Add-ons tab**.
2. Click the **Delete** (trash can) icon.
3. Confirm the deletion.

Uninstalling an add-on will remove all associated data and resources in that specific add-on's namespace.

## Troubleshooting

### Failed Installations

If an add-on fails to install (Status: `failed`):

1. **Check the error message** in the UI. It often contains details about which resource failed to start.
2. **Verify cluster resources**: Ensure your cluster has enough available CPU, GPU or RAM to host the add-on.
3. **Reinstall**: Sometimes transient network issues can cause a failure. You can delete the failed instance and try installing it again.

### Advanced: Inspecting Flux Logs

If you have `kubectl` access to your cluster, you can inspect the logs to see why a release is stuck:

```bash
# Check the status of all Helm releases
kubectl get helmrelease -A

# View logs from the Flux helm-controller
kubectl logs -n flux-system deployment/helm-controller
```

### Accessing the UI

If the add-on is `deployed` but you cannot reach the provided URL:

1. Ensure your VPN connection is active (if required for your cluster's network).
2. Check if the cluster's security groups allow traffic on the specified port.
