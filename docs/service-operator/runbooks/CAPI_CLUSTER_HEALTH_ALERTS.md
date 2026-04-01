# CAPI cluster health alerts

Responding to CAPI cluster health and provisioning alerts

## Purpose

This runbook covers the five Grafana alerts that monitor the health and provisioning lifecycle of tenant clusters created by the Cluster API (CAPI) driver:

| Alert | Trigger |
|---|---|
| **CAPI Cluster in Failed Phase** | A `Cluster` object has entered the `Failed` phase |
| **CAPI Machine in Failed Phase** | A `Machine` object has entered the `Failed` phase |
| **CAPI MachineDeployment Degraded** | A `MachineDeployment` has fewer ready replicas than desired |
| **CAPI Cluster Stuck in Provisioning** | A `Cluster` has been in `Pending` or `Provisioning` for more than 30 minutes |
| **CAPI MachineSet Workers Not Ready** | A `MachineSet` has fewer ready workers than desired for more than 30 minutes |

---

## Prerequisites Checklist

Before starting, ensure you have:
- [ ] Connected to the operator VPN (required to reach the management cluster)
- [ ] `kubectl` access to the management cluster (`KUBECONFIG` pointing to the management cluster)
- [ ] `clusterctl` installed (for enhanced cluster status output). See [docs](https://cluster-api.sigs.k8s.io/user/quick-start#install-clusterctl) for instructions
- [ ] OpenStack admin credentials sourced (`admin-openrc.sh`) — required if you need to SSH into worker nodes (Step 2.16)
- [ ] Access to Grafana to view current alert state and metric history

Set your kubeconfig for all commands in this runbook:

```bash
export KUBECONFIG=/path/to/management-cluster-kubeconfig
```

---

## Step 1: Identify the Affected Resource

### 1.1 Find which clusters are in a bad state

Run this to get a full overview of all CAPI resources and their current phases:

```bash
kubectl get clusters,machines,machinedeployments,machinesets -A
```

**Expected output when healthy:**
```
NAMESPACE        NAME                              PHASE
magnum-system    cluster/my-cluster                Provisioned

NAMESPACE        NAME                              PHASE     NODE
magnum-system    machine/my-cluster-worker-abc12   Running   worker-node-0
```

**If a resource shows `Failed`, `Pending`, or `Provisioning` in the PHASE column, note down its `NAME` and `NAMESPACE` before proceeding.**

### 1.2 Get a detailed cluster tree (recommended)

Use `clusterctl` to see the full hierarchy of a specific cluster in one view:

```bash
clusterctl describe cluster <cluster-name> -n magnum-system
```

This shows the relationship between Cluster → MachineDeployment → MachineSet → Machines and highlights any unhealthy resources.

---

## Step 2: Diagnose by Alert Type

Jump to the section that matches the firing alert.

---

### Alert: CAPI Cluster in Failed Phase

#### 2.1 Inspect the cluster object

```bash
kubectl describe cluster <cluster-name> -n magnum-system
```

Look at the `Status.Conditions` section at the bottom of the output. Each condition has a `Message` field that explains the root cause. Common conditions to check:

- `InfrastructureReady` — OpenStack infrastructure (network, security groups, VMs) is ready
- `ControlPlaneReady` — Kubernetes control plane is healthy
- `Ready` — overall cluster readiness

**Example of a failing condition:**
```
Status:
  Conditions:
    Message: failed to create OpenStack server: quota exceeded for instances
    Reason:  OpenStackError
    Status:  False
    Type:    InfrastructureReady
```

#### 2.2 Check CAPI controller logs

```bash
kubectl logs -n capi-system deploy/capi-controller-manager --tail=100 | grep -i "error\|failed\|<cluster-name>"
```

#### 2.3 Check OpenStack infrastructure provider logs

```bash
kubectl logs -n capo-system deploy/capo-controller-manager --tail=100 | grep -i "error\|failed\|<cluster-name>"
```

#### 2.4 Remediation

| Root cause | Action |
|---|---|
| OpenStack quota exceeded | Increase quota for the project, then delete and recreate the cluster |
| OpenStack API error (transient) | Delete the failed `Cluster` object — CAPI will retry provisioning |
| Misconfigured cluster spec | Correct the spec in the `Cluster` manifest and re-apply |
| Control plane nodes never became healthy | Proceed to the Machine runbook section below |

To delete and let the upper layer (e.g., Magnum or the user) recreate the cluster:
```bash
kubectl delete cluster <cluster-name> -n magnum-system
```

:::warning

Deleting a `Cluster` object will delete all associated `Machine`, `MachineDeployment`, and `MachineSet` objects and their underlying OpenStack VMs. Only do this after confirming with the tenant that the cluster can be recreated.

:::

---

### Alert: CAPI Machine in Failed Phase

#### 2.5 Identify the failed machine(s)

```bash
kubectl get machines -A --field-selector=status.phase=Failed
```

#### 2.6 Inspect the machine

```bash
kubectl describe machine <machine-name> -n magnum-system
```

Look for `Status.Conditions` and `Status.FailureMessage` for the root cause.

#### 2.7 Remediation

If the machine belongs to a `MachineDeployment` (check `ownerReferences` in the describe output), deleting it will cause the MachineDeployment controller to create a replacement:

```bash
kubectl delete machine <machine-name> -n magnum-system
```

Monitor the replacement:
```bash
kubectl get machines -n magnum-system -w
```

**Expected result:** A new machine appears in `Provisioning`, then transitions to `Running` within a few minutes.

If the machine is a control plane node (check if it has a `KubeadmControlPlane` owner), do **not** delete it without first confirming the control plane is healthy:

```bash
kubectl get kubeadmcontrolplane -n magnum-system
```

The `READY` column must show the expected replica count before removing a failed control plane node.

---

### Alert: CAPI MachineDeployment Degraded

This alert fires when `ready replicas < desired replicas` for 5 minutes. It typically means one or more worker nodes failed to join the cluster.

#### 2.8 Check MachineDeployment status

```bash
kubectl get machinedeployments -n magnum-system -o wide
```

The `READY` and `REPLICAS` columns will show the discrepancy.

#### 2.9 Find the unhealthy machines

```bash
kubectl get machines -n magnum-system -l cluster.x-k8s.io/deployment-name=<machinedeployment-name>
```

Look for machines not in `Running` phase, then follow [Step 2.6](#26-inspect-the-machine) for each.

#### 2.10 Remediation

Delete each non-Running machine. The MachineDeployment controller will replace them automatically:

```bash
kubectl delete machine <machine-name> -n magnum-system
```

---

### Alert: CAPI Cluster Stuck in Provisioning

This alert fires when a cluster has been in `Pending` or `Provisioning` for more than 30 minutes, indicating that provisioning has stalled.

#### 2.11 Check how long the cluster has been stuck

```bash
kubectl get cluster <cluster-name> -n magnum-system -o jsonpath='{.metadata.creationTimestamp}'
```

Compare against the current time to confirm the duration.

#### 2.12 Identify where provisioning is blocked

```bash
kubectl describe cluster <cluster-name> -n magnum-system
```

Check `Status.Conditions` for any `False` condition with a `Message`. Then check whether the underlying OpenStack resources were actually created:

```bash
kubectl describe openstackcluster <cluster-name> -n magnum-system
```

Look for `Status.Ready: false` and any error messages in `Status.FailureMessage`.

#### 2.13 Check CAPO logs for this cluster

```bash
kubectl logs -n capo-system deploy/capo-controller-manager --tail=200 | grep <cluster-name>
```

Common causes and actions:

| Cause | Action |
|---|---|
| OpenStack network/subnet creation pending | Check OpenStack Neutron logs on the control node |
| Floating IP pool exhausted | Allocate more floating IPs to the project |
| Image not found in Glance | Verify the machine image exists: `openstack image list` |
| CAPO controller crash-looping | Restart the CAPO controller: `kubectl rollout restart deploy/capo-controller-manager -n capo-system` |

---

### Alert: CAPI MachineSet Workers Not Ready

This alert fires when worker nodes have not become ready within 30 minutes, typically meaning nodes provisioned but failed to join Kubernetes.

#### 2.14 Check MachineSet and machine status

```bash
kubectl get machinesets -n magnum-system
kubectl get machines -n magnum-system
```

#### 2.15 Check if the node joined Kubernetes

For each machine in a non-Running phase, check whether its node registered:

```bash
kubectl get node <node-name>
```

If the node is missing, the issue is either in cloud-init (bootstrap) or network connectivity.

#### 2.16 Get cloud-init logs from the OpenStack VM

:::warning

Tenant clusters are created **without SSH access by default**. Before attempting to SSH into a worker node you must add the default security group to it in OpenStack, otherwise the connection will be refused.

You also need to be connected to the **tenant VPN** to reach the worker node's IP.

:::

Add the default security group to the worker node via the OpenStack CLI (run from the control node):

```bash
openstack server add security group <server-id> default
```

Then SSH to the affected worker node:

```bash
ssh ubuntu@<worker-node-ip> "sudo journalctl -u cloud-init --no-pager | tail -50"
```

Also check the kubeadm join log:

```bash
ssh ubuntu@<worker-node-ip> "sudo journalctl -u kubeadm --no-pager | tail -50"
```

#### 2.17 Remediation

If cloud-init or kubeadm join failed, delete the machine to let the MachineSet recreate it:

```bash
kubectl delete machine <machine-name> -n magnum-system
```

---

## Step 3: Confirm the Alert Has Cleared

After remediation, verify the cluster has returned to a healthy state:

```bash
kubectl get clusters,machines,machinedeployments,machinesets -A
```

All resources should show `Provisioned` / `Running` in the PHASE column.

In Grafana, navigate to **Alerting → Alert rules**, search for the alert that fired, and confirm the state has returned to **Normal**.

:::tip

CAPI metrics update on every kube-state-metrics scrape interval (default: 1 minute). Allow up to 2 minutes after the fix for the alert to clear.

:::

---

## Troubleshooting

### CAPO controller is not reconciling

Restart it:
```bash
kubectl rollout restart deploy/capo-controller-manager -n capo-system
kubectl rollout status deploy/capo-controller-manager -n capo-system
```

### `clusterctl describe` shows nothing for a cluster

The cluster object may be in a namespace not covered by `clusterctl`. Try:
```bash
kubectl get clusters --all-namespaces
```

### Alert keeps re-firing after deleting a machine

The MachineDeployment may be hitting the same underlying OpenStack error. Check OpenStack quotas, image availability, and network configuration before recreating.

### Cannot SSH to a worker node

Use the management cluster's bastion host. The worker node IP is in:
```bash
kubectl get openstackmachine -n magnum-system -o jsonpath='{.items[*].status.addresses}'
```
