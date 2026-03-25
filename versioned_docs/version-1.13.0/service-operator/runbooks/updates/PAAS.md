# Update AI Factory PaaS

Updating the Helm charts.

This runbook updates the `iaas-console` and `observability` Helm charts running on the management cluster. These are rolling K8s deployments — **no downtime**.

## Prerequisites

- [ ] `kubeconfig` of the management cluster in the assets dir

## Run

1. Download and extract the latest release bundle from the provided URL.
2. Run `platform-setup.sh --tags management-provision` on the bastion host.

## Verify

```bash
# Check all pods are Running or Completed
kubectl get pods -A

# Confirm iaas-console is healthy
kubectl get pods -n iaas-console

# Confirm observability is healthy
kubectl get pods -n phoenix-observability
```

## Rollback

1. Recover the previous release bundle.
2. Re-run the update procedure above using that folder.
3. If necessary, use Helm to rollback:

   ```bash
   helm rollback <release-name> <revision> -n <namespace>
   ```
