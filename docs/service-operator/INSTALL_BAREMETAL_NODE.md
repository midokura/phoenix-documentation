# Bare-Metal Node Enrollment and Server Creation

Enrolling bare-metal nodes and creating bare-metal servers.

This guide describes how operators enroll bare-metal nodes in the IaaS Console and how users create bare-metal servers using those enrolled nodes. No command-line steps are required.

### IaaS Configuration

The `os_rabbitmq_url` variable in the inventory is used by the IaaS Console to communicate with Ironic, enabling the migration of baremetal nodes from the provision VPC to a tenant VPC.

To retrieve the RabbitMQ URL:

```sh
ssh control0
grep /etc/kolla/ironic-api/ironic.conf -Fe 'rabbit://'
```

## Operator: Enroll a Bare-Metal Node
- **Access IaaS Console:** Sign in with an operator account.
- **Enroll the node:** Use the node enrollment workflow to register the hardware. Once submitted, the platform will automatically start the enrollment process.
- **Wait for Active state:** The system will progress through enrollment stages. When completed, the node’s status changes to **Active**, indicating it is ready to host bare-metal servers.

## Users: Create a Bare-Metal Server
- **Open Servers panel:** In the IaaS Console, go to **Servers**.
- **Start creation:** Select **+ Create Server**.
- **Choose server type:** Pick **Bare Metal**.
- **Select image:** Choose the operating system image required for your workload.

## Optional: Provide a User Script
- **Upload script:** During server creation, you can attach a user script to customize initialization.
- **Script types:** Depending on the selected operating system, you may provide:
  - A **bash** script
  - A **[cloud-init](https://cloud-init.io/)** configuration
- **Behavior:** The platform applies the script during provisioning to configure packages, users, networking, and other initialization tasks supported by the chosen OS.

Once the request is submitted, the platform provisions the bare-metal server on an Active node, applies any provided user script, and makes the instance available in the **Servers** panel.

## Prerequisites
- **Operator role:** You must have operator permissions in the IaaS Console to enroll hardware.
- **Hardware readiness:** Ensure out-of-band management (BMC/IPMI or Redfish) is reachable and configured. Verify power, networking (PXE-capable NIC), and rack connectivity.
- **Network placement:** Confirm the node is cabled to the provisioning network and the intended tenant networks according to your site design.
- **Images availability:** Required OS images must be available in the catalog. See [service-operator/IAAS_CONSOLE_CONFIGURATION.md](./IAAS_CONSOLE_CONFIGURATION.md) for image management.

## Enrollment Lifecycle
- **Enroll:** Operator registers the node via the Console. The platform validates management access.
- **Inspectable/Discovery:** Hardware characteristics are detected (CPU, RAM, disks, NICs).
- **Clean/Prepare:** The node is sanitized and prepared for deployment.
- **Active:** Node is ready to host bare-metal servers.

Typical enrollment completes within minutes, depending on hardware and network speed. If the node remains pending for an extended period, see Troubleshooting.

## Image and Placement Guidance
- **Sizing:** Choose images compatible with the server’s firmware boot mode (UEFI/BIOS) and storage layout.
- **Placement:** The scheduler selects an Active node meeting resource and network constraints. If capacity is unavailable, creation is queued or fails.

## User Scripts: Examples and Behavior
- **Execution timing:** Scripts run during provisioning and first boot, before the server is marked ready.
- **Supported formats:**
  - Bash: Inline boot-time customization.
  - Cloud-init: Declarative initialization for Linux distributions supporting cloud-init.
- **Example (cloud-init):**

  ```yaml
  #cloud-config
  users:
    - name: appuser
      ssh-authorized-keys:
        - ssh-rsa AAAA... your-key
  runcmd:
    - echo "hello from cloud-init" > /var/tmp/init.txt
  ```

- **Example (bash):**

  ```bash
  #!/usr/bin/env bash
  set -euo pipefail
  echo "hello from bash" > /var/tmp/init.txt
  ```

- **Common pitfalls:**
  - Mismatched OS and script type (e.g., cloud-init on images without cloud-init).
  - Using interactive commands or waiting for user input in scripts.

## Troubleshooting
- **Node stuck enrolling:** Verify BMC credentials, management network reachability, and that the console shows no hardware errors.
- **Server creation fails:** Check that at least one node is in Active state and that the selected image is compatible with the hardware.
