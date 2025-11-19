# Resource Management - Tenant

This guide explains how to manage resources within your tenant.

## Overview

Resources in Phoenix include:
- Compute resources (VMs, containers)
- Storage resources (volumes, object storage)
- Network resources (networks, load balancers)

## Viewing Resources

### Using the Web Console

1. Navigate to **Resources** in the main menu
2. Select the resource type you want to view
3. View details, status, and metrics for each resource

### Using the CLI

```bash
# List all resources
phoenix resource list

# List specific resource type
phoenix resource list --type compute

# View resource details
phoenix resource show <resource-id>
```

## Creating Resources

### Create a Compute Instance

1. Navigate to **Resources** > **Compute** > **Create**
2. Fill in the required fields:
   - Name
   - Size/flavor
   - Image/template
   - Network configuration
3. Click **Create**

### Create Storage Volume

1. Navigate to **Resources** > **Storage** > **Create Volume**
2. Specify:
   - Volume name
   - Size
   - Type (SSD, HDD)
3. Click **Create**

## Managing Resource Lifecycle

### Starting and Stopping Resources

```bash
# Start a resource
phoenix resource start <resource-id>

# Stop a resource
phoenix resource stop <resource-id>

# Restart a resource
phoenix resource restart <resource-id>
```

### Deleting Resources

⚠️ **Warning**: Deleting resources is permanent and cannot be undone.

```bash
# Delete a resource
phoenix resource delete <resource-id>

# Force delete (skip confirmations)
phoenix resource delete <resource-id> --force
```

## Resource Monitoring

Monitor resource usage and performance:

```bash
# View resource metrics
phoenix resource metrics <resource-id>

# View resource events
phoenix resource events <resource-id>
```

## Resource Quotas

Check your quota usage:

```bash
# View quota status
phoenix quota show

# View detailed quota breakdown
phoenix quota show --detailed
```

See [Quotas and Limits](quotas.md) for more information on managing quotas.

## Best Practices

1. **Tag Resources**: Use tags to organize and track resources
2. **Monitor Usage**: Regularly review resource usage to optimize costs
3. **Clean Up**: Delete unused resources to free up quota
4. **Use Templates**: Create templates for commonly used configurations
