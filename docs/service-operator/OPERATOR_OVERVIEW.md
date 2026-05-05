---
sidebar_position: 1
---

# Operator Overview

This is the reference sheet for AI Factory, an end-to-end solution to operate private, multi-tenant AI factories. Operators will find below an overview of the materials, infrastructure, and other requirements, and an entry point to the procedure to provision and configure the system.

Installer links, deployment files, and any other needed assets will be provided to clients directly. You can request them using the support@midokura.com email address.

## System requirements

:::note

Documentation files referenced here are provided in a downloadable artefact included in the hardware setup section.

:::

- Before proceeding, operators are expected to ensure that the underlying infrastructure meets the system requirements listed below.
- Operating system requirements for the OpenStack control nodes are available in [OS_REQUIREMENTS](./OS_REQUIREMENTS.md)
- Operators are expected to set up their hardware according to our official [Blueprint](https://midokurajpeast.blob.core.windows.net/phoenix-releases/v1.8/phoenix-v1.2-blueprint.pdf?sp=r&st=2026-02-13T11:27:08Z&se=2050-02-13T19:42:08Z&spr=https&sv=2024-11-04&sr=b&sig=3vUMLFssAVFvqhIZeOkvDsmDXeLVY8FSSOGWXoBL7ns%3D), specifically with regard to network configuration, port and interface assignment.
  - Base Operating System for OSt controllers should be ubuntu-24.04
- Storage. Operators are expected to provide a Ceph cluster, integrated in the infrastructure as defined in the blueprint. See more details in the [Hardware Setup](#hardware-setup)
- Set up OAuth application(s) for SSO. Supported providers are Google ([GOOGLE_SSO_SETUP](./GOOGLE_SSO_SETUP.md)) and Azure ([AZURE_SSO_SETUP](./AZURE_SSO_SETUP.md)). See the Software Installation section for details.
- Set up credentials for the private registry at ghcr.io/midokura. We will provide you with this token via secure means, and it will be required during the software installation process. More info at [GHCR_AUTHENTICATION](./GHCR_AUTHENTICATION.md).

## Overview

The sections below cover the full provisioning process, split into hardware setup (racking, OS installation, network fabric, storage) and software installation (deploying the control plane via Ansible playbooks from the bastion node).

## Hardware Setup

The hardware setup covers all physical and foundational infrastructure steps required before deploying the control plane. Build the inventory file (`inventory.yml`) progressively as you complete each step, using the included `inventory.example.yml` as your starting point.

1. **Rack and cable hardware** following the official [Blueprint](https://midokurajpeast.blob.core.windows.net/phoenix-releases/v1.8/phoenix-v1.2-blueprint.pdf?sp=r&st=2026-02-13T11:27:08Z&se=2050-02-13T19:42:08Z&spr=https&sv=2024-11-04&sr=b&sig=3vUMLFssAVFvqhIZeOkvDsmDXeLVY8FSSOGWXoBL7ns%3D) — pay particular attention to network topology, port and interface assignment, and storage cabling.
2. **Install OS on OpenStack control nodes** — Ubuntu 24.04 with RAID1 disks, VLAN interfaces, IOMMU, and required packages as specified in [OS_REQUIREMENTS](./OS_REQUIREMENTS.md).
3. **Set up the Router Box** — configure BIOS (AMT, Secure Boot), flash Ubuntu 24.04 to the machine, and run the unattended cloud-init install as described in [ROUTER_BOX_SETUP](./ROUTER_BOX_SETUP.md).
4. **Create the `bastion0` VM** on the router box — the KVM virtual machine that serves as the deployment host for all subsequent steps. See the [ROUTER_BOX_SETUP](./ROUTER_BOX_SETUP.md) bastion VM section.
5. **Bootstrap the network environment** — provisions the OpenWRT router VM, PXE/TFTP server, local Docker registry, and HedgeHog controller VM:
   ```bash
   ./scripts/platform-setup.sh --bootstrap
   ```
   See [ROUTER_BOX_CONFIGURATION](./ROUTER_BOX_CONFIGURATION.md) for configuration details.
6. **Set up the network fabric** — download the HedgeHog control node ISO, create the control VM, apply the fabric configuration, boot switches into ONIE, and install SONiC via HedgeHog auto-discovery. Follow all steps in [NETWORK_CONTROL_NODE_SETUP](./NETWORK_CONTROL_NODE_SETUP.md).
7. **Provision the Ceph cluster** — storage nodes must have Ubuntu installed and be reachable via SSH from the bastion before this step:
   - Run `platform-setup.sh --provision-ceph` to provision the cluster and generate keyrings, then promote them to `./keyrings/`
   - Complete the RADOS Gateway setup: start the gateway service and create the admin user before deploying OpenStack; configure Keystone integration after OpenStack is deployed
   - See [CEPH_SETUP](./CEPH_SETUP.md) for the full procedure.

## Software Installation

The software installation covers all steps to deploy and configure the control plane. Complete the hardware setup above before proceeding. Steps 1–3 prepare credentials and inventory configuration that must be in place before the deployment script runs.

1. **Set up GHCR credentials** — obtain a GitHub Personal Access Token with `read:packages` scope and add it to the inventory as described in [GHCR_AUTHENTICATION](./GHCR_AUTHENTICATION.md). If you plan to pre-populate the local Docker registry from GHCR during bootstrap (`registry_populate_images: true`), credentials must be obtained before Hardware Setup step 5.
2. **Set up SSO** — create the OAuth application(s) for your identity provider(s) and add the resulting credentials to the inventory. Before starting, determine your IaaS Console hostname (`console.<cluster_name>.<cluster_public_domain>`) as it is required for the redirect URI configuration:
   - Google: follow [GOOGLE_SSO_SETUP](./GOOGLE_SSO_SETUP.md) — produces `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
   - Azure: follow [AZURE_SSO_SETUP](./AZURE_SSO_SETUP.md) — produces `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET`, and `AZURE_TENANT_ID`
3. **Prepare TLS configuration** — create the Azure DNS zone, create a service principal with Contributor access, and add the resulting credentials to the inventory. Also point your public domain to the Azure DNS name servers. Follow steps 1–4 of [MANAGEMENT_TLS](./MANAGEMENT_TLS.md). Certificate issuance happens automatically during deployment.
4. **Run the full deployment** — executes the Ansible playbooks to deploy OpenStack, the management cluster, and the observability stack. The bootstrap and switch configuration steps were already completed during hardware setup, so run only the master script:
   ```bash
   ./scripts/platform-setup.sh
   ```
   See [DEPLOYMENT](./DEPLOYMENT.md) for inventory configuration details, available tags, and troubleshooting.
5. **Finalise TLS** — once the deployment completes, verify that Let's Encrypt staging certificates have been issued, then switch both `iaas_console_tls_cluster_issuer` and `obs_tls_cluster_issuer` to `letsencrypt-prod` in the inventory and re-run the deployment. See the Deploy section of [MANAGEMENT_TLS](./MANAGEMENT_TLS.md).
6. **Configure VPN access** — add operators to the WireGuard VPN following [OPERATOR_VPN_CONFIGURATION](./OPERATOR_VPN_CONFIGURATION.md).
7. **Verify the system is ready** — confirm deployment logs show no failures, management cluster nodes are in `Ready` state, and all pods are `Running`. See the [Verify Deployment Success](./DEPLOYMENT.md#verify-deployment-success) section of the deployment guide for the specific commands to run.

:::note

The verification steps above cover basic deployment health. A comprehensive end-to-end acceptance checklist — validating tenant workflows, GPU scheduling, IaaS Console access, and observability — is not yet documented and should be added here.

:::

## IaaS Console configuration

### IaaS Console - Tenant and User configuration

To create additional admin users, register tenants and tenant users, please refer to the instructions in [IAAS_CONSOLE_CONFIGURATION](./IAAS_CONSOLE_CONFIGURATION.md).

### IaaS Console - Cluster Add-ons

Cluster Add-ons (such as JupyterHub and KubeRay) are pre-configured in the system. For information on monitoring the feature's health and performing manual maintenance, please refer to the [ADDONS_OPERATOR_GUIDE](./ADDONS_OPERATOR_GUIDE.md).
