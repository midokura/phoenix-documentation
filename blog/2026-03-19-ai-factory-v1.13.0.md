---
slug: v1.13.0
title: AI Factory v1.13.0
authors: [midoteam]
tags: [aifactory]
---

Version 1.13.0 of AI Factory is now available.

## Overview

These release notes describe the revised steps, configuration details, and changes for provisioning and managing an AI Factory cluster under the new release.

<!-- truncate  -->

<!-- TODO: Add one section per major feature or change introduced in this release -->
### Feature 1

### Feature 2

...

### Remove automatic K8s API wide-open security group rule cleanup

The automatic cleanup task that removed the `0.0.0.0/0` inbound rule for port `6443` (Kubernetes API) from the management security group has been removed from the provisioning playbook.

**Manual step required:** If your environment had this wide-open rule applied as a hotfix, you must manually remove it during the upgrade to this version. Run the following commands, replacing `<sg_name>` with your management security group name:

```bash
# Find the rule ID
openstack security group rule list <sg_name> --protocol tcp --ingress --remote-ip 0.0.0.0/0

# Delete it
openstack security group rule delete <rule_id>
```

### Remove legacy SSH cleanup task

The one-time cleanup task that removed the legacy SSH `0.0.0.0/0` rule from `management-sg` has been removed from the provisioning playbook. All environments have already been updated to remove this rule in previous releases, so no manual action is required.

## Operator reference

The operator reference sheet for this release of AI Factory can be found in the [/docs](/docs/OPERATOR_REFERENCE) section.

Please contact support@midokura.com for more information.
