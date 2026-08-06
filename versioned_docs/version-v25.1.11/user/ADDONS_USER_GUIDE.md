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

## Model Provider

The **Model Provider** add-on deploys open-source language models on your cluster using vLLM, exposing an OpenAI-compatible inference API.

### Available Models

| Model name | Display name | Best suited for |
|---|---|---|
| `qwen3.5-35b` | Qwen3.5 35B A3B GPTQ Int4 | General-purpose text generation, tool calling, and reasoning tasks. |
| `kimi-vl-a3b` | Kimi VL A3B Instruct | Multimodal tasks combining text and images (vision-language). Use when the prompt includes images or visual context. |
| `qwen3.5-4b-guardrail` | Qwen3.5 4B AWQ 4bit | Lightweight guardrail or content classification tasks. Designed for fast, low-resource inference where a small model is sufficient. |

### Installing the Model Provider

When installing via the Add-ons tab, select one or more models from the catalog. Multiple models can be deployed simultaneously on the same add-on instance.

To install via the API:

```bash
export CLUSTER_ID="<your-cluster-id>"

curl -X POST \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"addon": "model-provider", "params": {"models": ["qwen3.5-35b"]}}' \
  "${API_BASE_URL}/clusters/${CLUSTER_ID}/addons"
```

### Using the Inference Endpoint

Once the add-on status is `deployed`, retrieve the inference endpoint URL using the instance name from the install response (for example, `model-provider-x7k2`):

```bash
export ADDON_NAME="model-provider-x7k2"
curl -H "Authorization: Bearer $JWT_TOKEN" \
  "${API_BASE_URL}/clusters/${CLUSTER_ID}/addons/${ADDON_NAME}"
```

The response `info.inference` field contains the base URL:

```bash
export INFERENCE_URL="http://<value from info.inference>"
```

**Text generation (chat completions)**:

```bash
curl -X POST "${INFERENCE_URL}/v1/chat/completions" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen3.5-35b",
    "messages": [
      {"role": "user", "content": "Explain Kubernetes resource limits in one paragraph."}
    ]
  }'
```

**Vision input (Kimi VL)**:

```bash
curl -X POST "${INFERENCE_URL}/v1/chat/completions" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "kimi-vl-a3b",
    "messages": [
      {
        "role": "user",
        "content": [
          {"type": "text", "text": "What is in this image?"},
          {"type": "image_url", "image_url": {"url": "https://example.com/image.png"}}
        ]
      }
    ]
  }'
```

**List available models on the endpoint**:

```bash
curl "${INFERENCE_URL}/v1/models"
```

### Storage and Data Retention

Each model uses a dedicated ReadWriteOnce PVC to store model weights. **Uninstalling the add-on deletes these PVCs**, so all downloaded model data is removed. Re-installing will re-download the model weights.

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
