# API Reference — Cluster Add-ons

This reference covers the endpoints for managing Helm-based add-ons on Kubernetes clusters.

## Overview

Cluster add-ons allow you to install common tools like JupyterHub and KubeRay on your provisioned clusters without needing to manage Helm directly. The IaaS API handles the lifecycle of these add-ons by coordinating with Flux on the tenant cluster.

### Authentication

All endpoints require a valid Bearer token with `user` scope.

```bash
export API_BASE_URL="https://your-iaas-domain/api"
export JWT_TOKEN="your-access-token"
```

## Endpoints

### List Available Add-ons (Catalog)

Retrieve the list of add-ons available for installation.

- **Method**: `GET`
- **Path**: `/api/addons/catalog`

**Response Example (200 OK)**:

```json
[
  {
    "name": "jupyterhub",
    "display_name": "JupyterHub",
    "description": "Notebook environment for data science",
    "version": "3.3.8",
    "params": {
      "cpu_limit": {
        "type": "number",
        "description": "CPU limit per notebook session"
      },
      "memory_limit": {
        "type": "string",
        "description": "Memory limit per notebook session (e.g. 4Gi)"
      }
    }
  },
  {
    "name": "kuberay",
    "display_name": "KubeRay Operator",
    "description": "Ray operator for distributed ML workloads",
    "version": "1.1.0",
    "params": {}
  }
]
```

### List Installed Add-ons

List all add-on instances installed on a specific cluster.

- **Method**: `GET`
- **Path**: `/api/clusters/{cluster_id}/addons`

**Response Example (200 OK)**:

```json
[
  {
    "name": "jupyterhub-x7k2",
    "addon_type": "jupyterhub",
    "status": "deployed",
    "version": "3.3.8",
    "cluster_id": "abc-123",
    "info": { "web_ui": "http://10.96.14.5:80" },
    "created_at": "2026-02-11T14:30:00Z",
    "updated_at": "2026-02-11T14:32:15Z"
  }
]
```

### Install an Add-on

Provision a new add-on instance on a cluster.

- **Method**: `POST`
- **Path**: `/api/clusters/{cluster_id}/addons`

**Request Body**:

```json
{
  "addon": "jupyterhub",
  "params": {
    "cpu_limit": 2,
    "memory_limit": "4Gi"
  }
}
```

**Response Example (202 Accepted)**:

```json
{
  "name": "jupyterhub-x7k2",
  "addon_type": "jupyterhub",
  "status": "pending-install",
  "version": "3.3.8",
  "message": null,
  "created_at": "2026-02-11T14:30:00Z",
  "updated_at": "2026-02-11T14:30:00Z"
}
```

**cURL Example**:

```bash
curl -X POST \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"addon": "jupyterhub", "params": {"cpu_limit": 1}}' \
  "${API_BASE_URL}/clusters/abc-123/addons"
```

### Get Add-on Instance Details

Retrieve the current status and information for a specific add-on instance.

- **Method**: `GET`
- **Path**: `/api/clusters/{cluster_id}/addons/{name}`

**Response Example (200 OK - Deployed)**:

```json
{
  "name": "jupyterhub-x7k2",
  "addon_type": "jupyterhub",
  "status": "deployed",
  "version": "3.3.8",
  "info": { "web_ui": "http://10.96.14.5:80" },
  "message": null,
  "created_at": "2026-02-11T14:30:00Z",
  "updated_at": "2026-02-11T14:32:15Z"
}
```

**Response Example (200 OK - Failed)**:

```json
{
  "name": "jupyterhub-x7k2",
  "addon_type": "jupyterhub",
  "status": "failed",
  "version": "3.3.8",
  "message": "pod jupyterhub-hub-xyz did not reach ready state within timeout",
  "created_at": "2026-02-11T14:30:00Z",
  "updated_at": "2026-02-11T14:45:00Z"
}
```

### Uninstall an Add-on

Remove an add-on instance and its associated Kubernetes resources.

- **Method**: `DELETE`
- **Path**: `/api/clusters/{cluster_id}/addons/{name}`

**Response Example (202 Accepted)**:
Returns an empty body or a status object confirming the deletion has started.

**cURL Example**:

```bash
curl -X DELETE \
  -H "Authorization: Bearer $JWT_TOKEN" \
  "${API_BASE_URL}/clusters/abc-123/addons/jupyterhub-x7k2"
```

## Response Models & Status Values

### Lifecycle Status

| Status | Description |
|--------|-------------|
| `pending-install` | The installation request has been accepted and Flux is deploying the chart. |
| `deployed` | The add-on is healthy and ready to use. |
| `failed` | The installation failed or the add-on is in an unhealthy state. |

### Error Codes

| Code | Description |
|------|-------------|
| `400 Bad Request` | Invalid parameters, or cluster version does not satisfy add-on requirements. |
| `401 Unauthorized` | Missing or invalid authentication token. |
| `404 Not Found` | Cluster or add-on instance not found. |
| `422 Unprocessable Entity` | Validation error in the request body. |
| `500 Internal Server Error` | Unexpected error communicating with the Kubernetes cluster. |
