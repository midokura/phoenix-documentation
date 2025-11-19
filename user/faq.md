# Frequently Asked Questions (FAQ)

Common questions and answers for Phoenix users.

## General Questions

### What is Phoenix?

Phoenix is a cloud platform that provides on-demand computing resources including virtual machines, storage, and networking capabilities.

### How do I get access to Phoenix?

Contact your organization's Phoenix administrator or tenant manager to request an account.

### Is there a cost for using Phoenix?

Billing and cost depends on your organization's Phoenix deployment. Contact your administrator for information about pricing and quotas.

## Account and Access

### I forgot my password. How do I reset it?

Click the "Forgot Password" link on the login page and follow the instructions sent to your email.

### How do I change my password?

```bash
# Via CLI
phoenix account change-password

# Via Web Console
1. Click your profile icon
2. Select "Account Settings"
3. Click "Change Password"
```

### Can I use SSH keys for authentication?

Yes! SSH keys are the recommended method for accessing compute instances.

```bash
# Add your SSH key
phoenix ssh-key add --name my-key --public-key ~/.ssh/id_rsa.pub
```

## Resources

### What's the difference between stopping and deleting a resource?

- **Stopping**: Temporarily halts the resource but preserves its state and data. You can start it again later.
- **Deleting**: Permanently removes the resource and all its data. This cannot be undone.

### How many resources can I create?

The number of resources you can create is limited by your quota. Check your quota with:

```bash
phoenix quota show
```

### Can I increase my quota?

Contact your tenant administrator to request a quota increase.

### Why can't I create a new resource?

Common reasons:
1. You've reached your quota limit
2. The requested size/type is not available
3. Insufficient permissions
4. Network or availability zone constraints

Check your quota and try a different configuration.

## Storage

### What happens to my storage when I delete a compute instance?

- **Boot volumes**: Deleted by default with the instance
- **Attached volumes**: Preserved unless explicitly deleted
- **Object storage**: Unaffected by compute instance lifecycle

### How do I backup my data?

For compute instances:
```bash
# Create a snapshot
phoenix snapshot create web-server --name backup-2024-01-01
```

For volumes:
```bash
# Create a volume snapshot
phoenix volume snapshot data-volume --name data-backup
```

### What's the difference between block storage and object storage?

- **Block Storage (Volumes)**: Traditional file system storage, attached to instances, suitable for databases and applications
- **Object Storage**: Scalable storage for files and unstructured data, accessed via HTTP API, suitable for backups and media files

## Networking

### Can my instances communicate with each other?

Yes, instances on the same network can communicate. Use private networks for isolated communication.

### How do I allow external access to my instance?

1. Assign a public IP address
2. Configure security group rules to allow traffic
3. Ensure application is listening on the appropriate port

### What is a security group?

A security group is a virtual firewall that controls inbound and outbound traffic for your resources.

## Troubleshooting

### My instance won't start. What should I do?

1. Check instance status: `phoenix compute show <instance-name>`
2. Review instance logs: `phoenix logs <instance-name>`
3. Verify quota availability
4. Contact support if the issue persists

### I can't connect to my instance via SSH

Check the following:
1. Instance is running: `phoenix compute show <instance-name>`
2. Security group allows SSH (port 22)
3. SSH key is correctly configured
4. Using correct username (varies by image: ubuntu, centos, admin, etc.)

### How do I view error messages?

```bash
# View instance logs
phoenix logs <instance-name>

# View detailed error information
phoenix compute show <instance-name> --verbose
```

### My resource is running slowly

1. Check resource metrics: `phoenix metrics show <resource-name>`
2. Verify you're not hitting CPU, memory, or disk I/O limits
3. Consider resizing to a larger size
4. Check application-level issues

## CLI and API

### How do I install the Phoenix CLI?

```bash
# Linux/macOS
curl -L https://releases.phoenix.example.com/cli/install.sh | bash

# Windows
# Download from https://releases.phoenix.example.com/cli/phoenix-windows.exe
```

### Where can I find API documentation?

API documentation is available at:
- Interactive API docs: `https://phoenix.example.com/api/docs`
- OpenAPI specification: `https://phoenix.example.com/api/openapi.json`

### How do I authenticate API requests?

Use API tokens for authentication:

```bash
# Create a token
phoenix token create --name my-api-token

# Use in API requests
curl -H "Authorization: Bearer <token>" https://phoenix.example.com/api/v1/resources
```

## Getting More Help

### Where can I find more documentation?

- [User Guide](user-guide.md) - Comprehensive documentation
- [CLI Reference](cli-reference.md) - Complete CLI command reference
- [Tutorials](tutorials/) - Step-by-step guides

### How do I contact support?

Contact your organization's Phoenix administrator or support team for assistance.

### Can I request new features?

Yes! Submit feature requests through your organization's feedback channel or contact your administrator.
