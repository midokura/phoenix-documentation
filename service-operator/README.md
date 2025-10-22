# Service Operator Documentation

## IaaS console

This is the documentation for the IaaS Operator APIs, specifically designed for system operators to manage users and tenants.

### Contents

- **[OPERATOR_API_GUIDE.md](./OPERATOR_API_GUIDE.md)** - Comprehensive usage guide with authentication instructions, common workflows, and practical examples
- **[operator-openapi.json](./operator-openapi.json)** - OpenAPI specification for Operator APIs (`/tenants` and `/users` endpoints)

### Overview

The Operator APIs are a focused subset of the full IaaS API, providing essential functionality for:
- User management
- Tenant management
- Authentication workflows

### Getting Started

1. Read the [Operator API Usage Guide](./OPERATOR_API_GUIDE.md) for detailed instructions
2. Use the [OpenAPI specification](./operator-openapi.json) for API reference and integration

### API Generation

The OpenAPI specification is auto-generated using:
```bash
iaas_api --operator-openapi > operator-openapi.json
```
