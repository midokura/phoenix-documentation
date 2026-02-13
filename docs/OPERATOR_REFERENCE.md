---
sidebar_position: 1
---

# Operator Reference

This is the reference sheet for AI Factory, an end-to-end solution to operate private, multi-tenant AI factories. Operators will find below an overview of the materials, infrastructure, and other requirements, and an entry point to the procedure to provision and configure the system.

Please contact support@midokura.com for more information.

## System requirements

Note: documentation files referenced here are provided in a downloadable artefact included in the environment setup section.

- Before proceeding, operators are expected to ensure that the underlying infrastructure meets the system requirements listed below.
- Operating system requirements for the OpenStack control nodes are available in [OS_REQUIREMENTS](./service-operator/OS_REQUIREMENTS.md)
- Operators are expected to set up their hardware according to our official [Blueprint](https://midokurajpeast.blob.core.windows.net/phoenix-releases/v1.7/phoenix-v1.2-blueprint.pdf?sp=r&st=2026-01-30T13:10:53Z&se=2056-01-30T21:25:53Z&spr=https&sv=2024-11-04&sr=b&sig=XFfdb5z2bLesT9rd9OPArb7iSp%2BmjObROHlttb0ZDms%3D), specifically with regard to network configuration, port and interface assignment.
  - Base Operating System for OSt controllers should be ubuntu-24.04
- Storage. Operators are expected to provide a Ceph cluster, integrated in the infrastructure as defined in the blueprint. See more details in the [Environment setup](#environment-setup)
- Set up a new Google Application that will be used as an SSO provider for the IaaS service. To follow this process, consult the
[GOOGLE_SSO_SETUP](./service-operator/GOOGLE_SSO_SETUP.md).
- Set up credentials for the private registry at ghcr.io/midokura. We will provide you with this token via secure means, and it will be required during the control plane installation process. More info at [GHCR_AUTHENTICATION](./service-operator/GHCR_AUTHENTICATION.md).

## Overview

The sections below provide references to materials required to proceed with the provisioning process, which takes place from the Bastion node shown in the blueprint. On a high level, the process is based on a bundle of Ansible playbooks that will install and configure all components in the control plane.

## Environment setup

To install the Phoenix cluster, the Operator will work from the bastion node reflected in the blueprint. Create a new directory `./phoenix`. This will serve to store artefacts and playbooks. All commands and paths in this document are relative to this directory.

## Control plane installation

- Prepare the Ceph cluster by following the steps explained in [CEPH_SETUP](./service-operator/CEPH_SETUP.md)
- Download and extract [Ansible playbooks](https://midokurajpeast.blob.core.windows.net/phoenix-releases/v1.7/release-assets-0.0.0-977-5238f15.zip?sp=r&st=2026-01-30T14:03:42Z&se=2056-01-30T22:18:42Z&spr=https&sv=2024-11-04&sr=b&sig=GdlO1lHWdJsIkFAN9TmqXSVCZ%2Bg44kmWrdSviOujIjA%3D).
- Use the included `inventory.example.yml` as the base to input the configuration specific to your cluster
- Execute them following the instructions in [DEPLOYMENT](./service-operator/DEPLOYMENT.md)
- To configure switches, follow the instructions in
[NETWORK_CONTROL_NODE_SETUP](./service-operator/NETWORK_CONTROL_NODE_SETUP.md) starting step 4

## IaaS Console - Tenant and User configuration

To create additional admin users, register tenants and tenant users, please refer to the instructions in [IAAS_CONSOLE_CONFIGURATION](./service-operator/IAAS_CONSOLE_CONFIGURATION.md).
