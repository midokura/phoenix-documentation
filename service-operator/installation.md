# Installation Guide - Service Operator

This guide provides detailed instructions for installing Phoenix infrastructure.

## Installation Methods

Phoenix can be installed using several methods:
- Container-based deployment (Docker/Kubernetes)
- Package-based installation (RPM/DEB)
- Source-based installation

## System Requirements

### Hardware Requirements
- CPU: 4+ cores
- RAM: 16GB minimum, 32GB recommended
- Storage: 100GB+ SSD storage
- Network: 1Gbps network interface

### Software Requirements
- Operating System: Ubuntu 20.04+, RHEL 8+, or compatible
- Container Runtime: Docker 20.10+ or containerd 1.6+
- Database: PostgreSQL 12+ or compatible
- Load Balancer: HAProxy, Nginx, or cloud-native LB

## Installation Steps

### 1. Prepare the Environment

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install required dependencies
sudo apt install -y curl wget git
```

### 2. Install Phoenix

```bash
# Download Phoenix installer
curl -O https://releases.phoenix.example.com/install.sh

# Run installer
sudo bash install.sh
```

### 3. Configure Phoenix

Edit the configuration file at `/etc/phoenix/config.yaml`:

```yaml
# Basic configuration
server:
  host: 0.0.0.0
  port: 8080

database:
  host: localhost
  port: 5432
  name: phoenix
```

### 4. Start Services

```bash
# Start Phoenix services
sudo systemctl start phoenix
sudo systemctl enable phoenix

# Verify status
sudo systemctl status phoenix
```

## Verification

Verify the installation is successful:

```bash
# Check service health
curl http://localhost:8080/health

# View logs
sudo journalctl -u phoenix -f
```

## Troubleshooting

If you encounter issues during installation, see the [Troubleshooting Guide](troubleshooting.md).
