# Getting Started - User Guide

Welcome to Phoenix! This guide will help you get started with using the platform.

## Introduction

Phoenix is a platform that provides you with resources to run your applications and workloads. This guide will walk you through the basics of using Phoenix.

## Prerequisites

- Phoenix account credentials (provided by your tenant administrator)
- Access to the Phoenix web console or CLI

## Logging In

### Web Console

1. Navigate to your Phoenix URL (provided by your administrator)
2. Enter your email and password
3. Click **Sign In**

### CLI

First, install the Phoenix CLI:

```bash
# Linux/macOS
curl -L https://releases.phoenix.example.com/cli/install.sh | bash

# Windows
# Download from https://releases.phoenix.example.com/cli/phoenix-windows.exe
```

Then authenticate:

```bash
# Login to Phoenix
phoenix login

# Enter your credentials when prompted
Email: your-email@example.com
Password: ********
```

## Your First Resource

Let's create your first compute instance:

### Using the Web Console

1. Click **Create Resource** from the dashboard
2. Select **Compute Instance**
3. Fill in the details:
   - **Name**: my-first-instance
   - **Size**: Small (2 CPU, 4GB RAM)
   - **Image**: Ubuntu 22.04
4. Click **Create**

### Using the CLI

```bash
# Create a compute instance
phoenix compute create \
  --name my-first-instance \
  --size small \
  --image ubuntu-22.04
```

## Connecting to Your Resource

Once your instance is running, you can connect to it:

```bash
# Get connection information
phoenix compute show my-first-instance

# SSH to the instance (if SSH keys are configured)
phoenix compute ssh my-first-instance
```

## Managing Your Resources

### View Your Resources

```bash
# List all your resources
phoenix resource list

# View specific resource
phoenix resource show my-first-instance
```

### Stop and Start Resources

```bash
# Stop a resource
phoenix resource stop my-first-instance

# Start a resource
phoenix resource start my-first-instance
```

### Delete Resources

When you're done with a resource:

```bash
# Delete a resource
phoenix resource delete my-first-instance
```

## Getting Help

- Type `phoenix help` for CLI command reference
- Click the **?** icon in the web console for contextual help
- See the [User Guide](user-guide.md) for detailed documentation
- Check the [FAQ](faq.md) for common questions

## Next Steps

- [User Guide](user-guide.md) - Comprehensive guide to using Phoenix
- [Tutorials](tutorials/) - Step-by-step tutorials
- [CLI Reference](cli-reference.md) - Complete CLI command reference
