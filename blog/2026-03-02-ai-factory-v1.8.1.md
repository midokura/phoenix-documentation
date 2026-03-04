---
slug: v1.8.1
title: AI Factory v1.8.1
authors: [midoteam]
tags: [aifactory]
---

Version 1.8.1 of AI Factory is now available.

## Overview

These release notes describe the revised steps, configuration details, and changes for provisioning and managing an AI Factory cluster under the new release.

This version fixes an issue with Tenant Clusters that could not be created.

<!-- truncate -->

### Fix: Cluster functionality didn't work
We discovered a problem with v1.8 that affected new Cluster creations. This issue was due to version pinning on dependencies that are not hosted by us. We've fixed this issue by always using the latest version of those dependencies. This issue was not caught during testing because those dependencies were available on the remote platform, at that time.

## Upgrade process

Assuming you have v1.8 installed, download the latest release assets and run the following command:
```
./scripts/platform-setup.sh --tags provision,iaas-console 
```
If you haven't installed AI Factory yet, or are on v1.7 or older, we recommend installing the latest version, but in the case you need to install this version, follow the Operator Reference as you normally would.

## Operator reference

The operator reference sheet for this release of AI Factory can be found in the [/docs](/docs/OPERATOR_REFERENCE) section.

Please contact support@midokura.com for more information.



