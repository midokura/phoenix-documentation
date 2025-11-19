# User Guide

Complete guide to using Phoenix as an end user.

## Overview

This guide covers all aspects of using Phoenix, from creating resources to monitoring and managing your workloads.

## Table of Contents

1. [Understanding Phoenix](#understanding-phoenix)
2. [Working with Compute Resources](#working-with-compute-resources)
3. [Storage Management](#storage-management)
4. [Networking](#networking)
5. [Monitoring and Logs](#monitoring-and-logs)
6. [Security](#security)

## Understanding Phoenix

Phoenix provides you with on-demand computing resources. Key concepts include:

### Resources
Physical or virtual assets you can create and manage:
- **Compute**: Virtual machines and containers
- **Storage**: Persistent volumes and object storage
- **Network**: Virtual networks and connectivity

### Projects
Logical groupings of resources for organization and billing.

### Quotas
Limits on the amount of resources you can use.

## Working with Compute Resources

### Creating Compute Instances

Compute instances are virtual machines you can use to run applications.

**Available Sizes:**
- **Tiny**: 1 CPU, 2GB RAM - For testing and light workloads
- **Small**: 2 CPU, 4GB RAM - For small applications
- **Medium**: 4 CPU, 8GB RAM - For standard workloads
- **Large**: 8 CPU, 16GB RAM - For demanding applications

**Create an instance:**

```bash
phoenix compute create \
  --name web-server \
  --size medium \
  --image ubuntu-22.04 \
  --network default
```

### Accessing Compute Instances

**Via SSH:**

```bash
# Using SSH keys (recommended)
phoenix compute ssh web-server

# Using password authentication
ssh user@<instance-ip>
```

**Via Web Console:**

1. Navigate to **Resources** > **Compute**
2. Click on your instance
3. Click **Console** to open web-based terminal

### Managing Instance Lifecycle

```bash
# Start an instance
phoenix compute start web-server

# Stop an instance
phoenix compute stop web-server

# Restart an instance
phoenix compute restart web-server

# Resize an instance
phoenix compute resize web-server --size large

# Delete an instance
phoenix compute delete web-server
```

## Storage Management

### Persistent Volumes

Create volumes to store data persistently:

```bash
# Create a volume
phoenix volume create \
  --name data-volume \
  --size 100GB \
  --type ssd

# Attach to an instance
phoenix volume attach data-volume web-server

# Detach from instance
phoenix volume detach data-volume
```

### Object Storage

Use object storage for unstructured data:

```bash
# Create a bucket
phoenix storage create-bucket my-bucket

# Upload files
phoenix storage upload my-bucket local-file.txt

# Download files
phoenix storage download my-bucket remote-file.txt

# List bucket contents
phoenix storage list my-bucket
```

## Networking

### Virtual Networks

Create isolated networks for your resources:

```bash
# Create a network
phoenix network create \
  --name private-network \
  --subnet 10.0.0.0/24

# List networks
phoenix network list
```

### Security Groups

Control network access with security groups:

```bash
# Create security group
phoenix security-group create \
  --name web-sg \
  --description "Security group for web servers"

# Add rules
phoenix security-group add-rule web-sg \
  --protocol tcp \
  --port 80 \
  --source 0.0.0.0/0

phoenix security-group add-rule web-sg \
  --protocol tcp \
  --port 443 \
  --source 0.0.0.0/0
```

## Monitoring and Logs

### Resource Metrics

View metrics for your resources:

```bash
# View CPU and memory metrics
phoenix metrics show web-server

# View metrics for specific time range
phoenix metrics show web-server \
  --start "2024-01-01 00:00:00" \
  --end "2024-01-01 23:59:59"
```

### Logs

Access logs from your instances:

```bash
# View recent logs
phoenix logs web-server

# Stream logs in real-time
phoenix logs web-server --follow

# Filter logs
phoenix logs web-server --filter "error"
```

## Security

### SSH Keys

Manage SSH keys for secure access:

```bash
# Add SSH key
phoenix ssh-key add \
  --name my-laptop \
  --public-key ~/.ssh/id_rsa.pub

# List SSH keys
phoenix ssh-key list

# Delete SSH key
phoenix ssh-key delete my-laptop
```

### API Tokens

Create API tokens for programmatic access:

```bash
# Create token
phoenix token create --name automation-token

# List tokens
phoenix token list

# Revoke token
phoenix token revoke automation-token
```

## Best Practices

1. **Resource Naming**: Use descriptive names for easy identification
2. **Tagging**: Tag resources for organization and cost tracking
3. **Security**: Always use SSH keys instead of passwords
4. **Backups**: Regularly backup important data
5. **Monitoring**: Set up alerts for resource issues
6. **Cost Management**: Stop or delete unused resources
