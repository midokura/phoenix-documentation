# Operator API Usage Guide

## Overview

This guide provides practical instructions for using IaaS Operator APIs to manage users and tenants. The Operator APIs are a focused subset of the full IaaS API, designed specifically for system operators to perform essential user and tenant management tasks.

## Authentication

### Getting Your Authentication Token

To access the Operator APIs, you need to obtain an authentication token from the NTY Gridworks Dashboard:

1. **Login to the IaaS UI** with your operator account
2. **Navigate to the Operator tab** in the interface
3. **Copy the Auth token** displayed in the Operator section
4. **Use the token** in your API requests

### JWT Token Authentication
```bash
# Set your API base URL (adjust for your environment)
export API_BASE_URL="http://base-url/api"

# Set your JWT token (obtained from UI Operator tab)
export JWT_TOKEN="your-jwt-token-from-ui-operator-tab"

# Use in API calls
curl -H "Authorization: Bearer $JWT_TOKEN" \
     -H "Content-Type: application/json" \
     "${API_BASE_URL}/users/me"
```

## API Reference

Complete API documentation is available on your running IaaS server:

- **Swagger UI**: `${API_BASE_URL}/docs`
- **OpenAPI spec**: `${API_BASE_URL}/openapi.json`

These provide the most current documentation for your deployed version.

### User Management APIs

#### List All Users
```bash
curl -H "Authorization: Bearer $JWT_TOKEN" \
     "${API_BASE_URL}/users"
```

#### Create a New User
```bash
curl -X POST \
     -H "Authorization: Bearer $JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "email": "john.doe@example.com",
       "role": "member",
       "ssh_key_id": null
     }' \
     "${API_BASE_URL}/users"
```

#### Get Current User Information
```bash
curl -H "Authorization: Bearer $JWT_TOKEN" \
     "${API_BASE_URL}/users/me"
```

#### Update User Information
```bash
curl -X PUT \
     -H "Authorization: Bearer $JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "email": "john.smith@example.com",
       "role": "operator",
       "ssh_key_id": null
     }' \
     "${API_BASE_URL}/users/{user_id}"
```

#### Delete a User
```bash
curl -X DELETE \
     -H "Authorization: Bearer $JWT_TOKEN" \
     "${API_BASE_URL}/users/{user_id}"
```

### Tenant Management APIs

#### List All Tenants
```bash
curl -H "Authorization: Bearer $JWT_TOKEN" \
     "${API_BASE_URL}/tenants"
```

#### Create a New Tenant
```bash
curl -X POST \
     -H "Authorization: Bearer $JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "development-team",
       "users": []
     }' \
     "${API_BASE_URL}/tenants"
```

**Note**: Each user can belong to only one tenant at a time. When assigning users during tenant creation, you must provide their WireGuard public key for VPN access.

#### Delete a Tenant
```bash
curl -X DELETE \
     -H "Authorization: Bearer $JWT_TOKEN" \
     "${API_BASE_URL}/tenants/{tenant_id}"
```

#### Add User to Tenant
```bash
curl -X PUT \
     -H "Authorization: Bearer $JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "pubkey": "user-wireguard-public-key"
     }' \
     "${API_BASE_URL}/tenants/{tenant_id}/users/{user_id}"
```

**Note**: You must provide the user's WireGuard public key to configure VPN access. Each user can belong to only one tenant at a time.

#### Remove User from Tenant
```bash
curl -X DELETE \
     -H "Authorization: Bearer $JWT_TOKEN" \
     "${API_BASE_URL}/tenants/{tenant_id}/users/{user_id}"
```

## Common Use Cases and Workflows

### Use Case 1: Create a New User and Add to Existing Tenant

**Scenario**: A new employee joins and needs access to an existing project.

**Workflow**:
1. Create a new user account
2. Add the user to existing tenant

```bash
# Step 1: Create the user
curl -X POST \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice.smith@company.com",
    "role": "member",
    "ssh_key_id": null
  }' \
  ${API_BASE_URL}/users

# Step 2: List tenants to find the target tenant ID
curl -H "Authorization: Bearer $JWT_TOKEN" \
     ${API_BASE_URL}/tenants

# Step 3: Add user to tenant (replace USER_ID, TENANT_ID, and PUBKEY with actual values)
curl -X PUT \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pubkey": "WIREGUARD_PUBLIC_KEY"
  }' \
  ${API_BASE_URL}/tenants/TENANT_ID/users/USER_ID
```

### Use Case 2: Move User Between Tenants

**Scenario**: Moving a user from one project team to another.

**Workflow**:
1. Remove user from old tenant
2. Add user to new tenant

```bash
# Step 1: Remove from old tenant
curl -X DELETE \
     -H "Authorization: Bearer $JWT_TOKEN" \
     ${API_BASE_URL}/tenants/OLD_TENANT_ID/users/USER_ID

# Step 2: Add to new tenant
curl -X PUT \
     -H "Authorization: Bearer $JWT_TOKEN" \
     ${API_BASE_URL}/tenants/NEW_TENANT_ID/users/USER_ID
     -H "Content-Type: application/json" \
     -d '{
       "pubkey": "WIREGUARD_PUBLIC_KEY"
     }' \
     ${API_BASE_URL}/tenants/NEW_TENANT_ID/users/USER_ID
```

### Use Case 3: Create New Project with Team

**Scenario**: Setting up a new project with a dedicated team.

**Workflow**:
1. Create new tenant for the project with team members

```bash
# Create project tenant with team members at once
curl -X POST \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "project-alpha",
    "users": [
      {"user_id": "USER_ID_1", "pubkey": "WIREGUARD_PUBLIC_KEY_1"},
      {"user_id": "USER_ID_2", "pubkey": "WIREGUARD_PUBLIC_KEY_2"}
    ]
  }' \
  ${API_BASE_URL}/tenants
```

**Note**: You can also add users to existing tenants later:
```bash
curl -X PUT \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pubkey": "WIREGUARD_PUBLIC_KEY"
  }' \
  ${API_BASE_URL}/tenants/PROJECT_TENANT_ID/users/ADDITIONAL_USER_ID
```

### Use Case 4: Employee Offboarding

**Scenario**: An employee is leaving and needs to be removed from all systems.

**Workflow**:
1. List all tenants to identify user memberships (optional, for verification)
2. Delete the user account (automatically removes from all tenants)

```bash
# Step 1: Check current tenants (optional, for verification)
curl -H "Authorization: Bearer $JWT_TOKEN" \
     ${API_BASE_URL}/tenants

# Step 2: Delete the user (automatically removes from all tenants)
curl -X DELETE \
     -H "Authorization: Bearer $JWT_TOKEN" \
     ${API_BASE_URL}/users/USER_ID
```

**Note**: When you delete a user, the system automatically removes that user from all tenants they belong to. There's no need to manually remove the user from each tenant first.

### Use Case 5: Update User Role

**Scenario**: Promoting a user from member to operator.

**Workflow**:
1. Get current user information
2. Update user role

```bash
# Step 1: Check current user details
curl -H "Authorization: Bearer $JWT_TOKEN" \
     ${API_BASE_URL}/users

# Step 2: Update user role
curl -X PUT \
     -H "Authorization: Bearer $JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "email": "user@company.com",
       "role": "operator",
       "ssh_key_id": null
     }' \
     ${API_BASE_URL}/users/USER_ID
```
