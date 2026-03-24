# Update Management Cluster

Updating management cluster version.

**Downtime scope:** The k8s management plane and deployed services (iaas-console, observability) is briefly unavailable during the update. OpenStack services and tenant workloads are **not affected** — they run independently of the management cluster.

## When to Update

- K8s version bump
- Changes to management cluster node configuration (instance flavors, node count, security groups)
- Network configuration changes for the management cluster

## Procedure

1. Run the management cluster update:

   ```bash
   platform-setup.sh --tags management
   ```

2. Verify:

   ```bash
   kubectl get nodes
   # All nodes should show STATUS=Ready

   kubectl get pods -A
   # All pods should be Running or Completed
   ```

## Notes

- The management cluster runs on OpenStack VMs. If a node needs to be replaced (not just updated), the role will create a new VM and drain the old one.
- The `kubeconfig` is vault-encrypted and stored in `assets/` dir after deployment. If it changes after the update, re-distribute the new file to any operators who need it.
