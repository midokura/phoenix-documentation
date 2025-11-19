# User Management - Tenant

This guide explains how to manage users and permissions within your tenant.

## User Roles

Phoenix provides several predefined roles for tenants:

### Tenant Admin
- Full administrative access within the tenant
- Can manage users, resources, and settings
- Can view and modify all tenant configurations

### Tenant User
- Can create and manage their own resources
- Can view tenant-level information
- Cannot manage other users or tenant settings

### Tenant Viewer
- Read-only access to tenant resources
- Cannot create or modify resources
- Useful for auditors or managers

## Adding Users

### Using the Web Console

1. Navigate to **Users** > **Add User**
2. Enter user information:
   - Email address
   - Full name
   - Initial role
3. Click **Send Invitation**
4. User will receive an email with setup instructions

### Using the CLI

```bash
# Add a new user
phoenix user create \
  --email user@example.com \
  --name "John Doe" \
  --role tenant-user

# Add user with multiple roles
phoenix user create \
  --email admin@example.com \
  --name "Jane Admin" \
  --role tenant-admin
```

## Managing User Permissions

### Assigning Roles

```bash
# Assign role to user
phoenix user assign-role <user-id> tenant-admin

# Remove role from user
phoenix user remove-role <user-id> tenant-user
```

### Custom Permissions

For fine-grained control, you can create custom permission sets:

```bash
# Create custom permission set
phoenix permission create \
  --name "resource-manager" \
  --allow "resource:create,resource:delete"

# Assign to user
phoenix user assign-permission <user-id> resource-manager
```

## Viewing Users

### List All Users

```bash
# List all users in tenant
phoenix user list

# Filter by role
phoenix user list --role tenant-admin

# Search by name or email
phoenix user list --search "john"
```

### View User Details

```bash
# Show user details
phoenix user show <user-id>

# Include activity history
phoenix user show <user-id> --include-activity
```

## Disabling and Removing Users

### Disable a User

Disabling a user prevents login but retains their data:

```bash
# Disable user
phoenix user disable <user-id>

# Re-enable user
phoenix user enable <user-id>
```

### Remove a User

⚠️ **Warning**: Removing a user will transfer or delete their resources.

```bash
# Remove user (interactive - will prompt for resource handling)
phoenix user delete <user-id>

# Remove user and transfer resources
phoenix user delete <user-id> --transfer-to <other-user-id>
```

## User Activity Monitoring

Monitor user activity and access:

```bash
# View user login history
phoenix user activity <user-id> --type login

# View user resource access
phoenix user activity <user-id> --type resource-access

# Audit user actions
phoenix audit user <user-id> --days 30
```

## Best Practices

1. **Principle of Least Privilege**: Grant users only the permissions they need
2. **Regular Audits**: Periodically review user access and permissions
3. **Offboarding**: Promptly disable users who no longer need access
4. **Role-Based Access**: Use predefined roles when possible for consistency
