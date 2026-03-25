# Re-provision Node OS

Re-provisioning a cluster node via PXE.

Use this procedure for OS updates, disaster recovery, or adding a new node (Control, Compute, Storage, or GPU) to the cluster.

**Impact: Full node downtime.** The node must be rebooted and re-imaged.

## Prerequisites

- [ ] IPMI/BMC access to the target node
- [ ] OpenStack admin credentials (for compute nodes with running instances)

*Note: For OpenStack commands, run `platform-setup.sh --shell` to enter the management container.*

## Procedure

### 1. Evacuate the Node (Compute nodes only)

If the node is a compute node with running instances, migrate them before proceeding.

1. Disable the compute service to prevent new instances from being scheduled:

    ```bash
    openstack compute service set --disable --reason "Re-provisioning" <host-name>
    ```

2. List and migrate all instances:

    ```bash
    openstack server list --host <host-name> --all-projects

    # Live migrate each instance (repeat for all)
    openstack server migrate --wait --live-migration <instance-id>
    ```

    *Verify migration success with `openstack server show <instance-id>`.*

### 2. Update PXE Configuration

Apply the PXE configuration with the desired OS image:

```bash
platform-setup.sh --bootstrap
```

### 3. Re-provision the Node

1. Boot the node into PXE mode using IPMI:

    ```bash
    ipmitool -I lanplus -H <ipmi-ip> -U <user> -P <pass> chassis bootdev pxe
    ipmitool -I lanplus -H <ipmi-ip> -U <user> -P <pass> power cycle
    ```

2. Monitor the installation via IPMI Serial-over-LAN:

    ```bash
    ipmitool -I lanplus -H <ipmi-ip> -U <user> -P <pass> sol activate
    ```

### 4. Verify

1. SSH into the node and verify the OS version:

    ```bash
    cat /etc/os-release
    uname -r
    ```

    *Check the output against the expected version in the target release notes.*

2. For compute nodes, re-enable the service and migrate instances back:

    ```bash
    openstack compute service set --enable <host-name>

    openstack server migrate --wait --live-migration <instance-id> --host <host-name>
    ```

## Rollback

If the node fails to boot or install:

1. Revert the changes in `inventory.yml` to the previous known-good configuration.
2. Run `platform-setup.sh --bootstrap` to restore the old boot files.
3. Reboot the node via IPMI again.

## References

- [Adding and removing hosts
](https://docs.openstack.org/kolla-ansible/2025.1/user/adding-and-removing-hosts.html)
