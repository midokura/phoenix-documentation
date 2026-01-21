# GitHub Container Registry (GHCR) Authentication

Authenticating with GitHub Container Registry (ghcr.io).

This guide explains how to authenticate with GitHub Container Registry [ghcr.io](http://ghcr.io/)) using Docker or Podman.

## Prerequisites

- GitHub account with appropriate repository access
- Docker or Podman installed on your system

## Creating a Personal Access Token (PAT)

1. **Navigate to GitHub Settings**
   - Go to https://github.com/settings/tokens
   - Or: Click your profile photo → Settings → Developer settings → Personal access tokens → Tokens (classic)

2. **Generate New Token**
   - Click "Generate new token" → "Generate new token (classic)"
   - Provide a descriptive note (e.g., "GHCR Access for Service Operator")
   - Set expiration date as needed

3. **Select Required Scopes**
   For GHCR access, select at minimum:
   - `read:packages` - Download container images

4. **Generate and Save Token**
   - Click "Generate token"
   - **IMPORTANT**: Copy the token immediately - you won't be able to see it again
   - Store it securely (password manager recommended)

## Authentication

### Add to your inventory.yml

For secure token storage in inventory files:

1. **Encrypt the token using Ansible Vault:**

   ```bash
   ansible-vault encrypt_string 'ghp_YourToken' --name 'ghcr_pat' --ask-vault-password
   ```

   You'll be prompted to create a vault password. The command will output encrypted text.

2. **Add to `inventory.yml`:**

   ```yaml
   all:
     vars:
       iaas_console:
         ghcr_user: "your-github-username"
         ghcr_pat: !vault |
           $ANSIBLE_VAULT;1.1;AES256
           ... encrypted token ...
   ```

### Docker/Podman Direct Login

```bash
# Docker
echo "YOUR_GITHUB_TOKEN" | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin

# Podman
echo "YOUR_GITHUB_TOKEN" | podman login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
```

## Verifying Authentication

Test your authentication by pulling a public image:

```bash
# Docker
docker pull ghcr.io/midokura/gpu-infra-ansible:v0.1

# Podman
podman pull ghcr.io/midokura/gpu-infra-ansible:v0.1
```

## Token Storage Location

Credentials are stored in:

- **Docker**: `~/.docker/config.json`
- **Podman**: `${XDG_RUNTIME_DIR}/containers/auth.json` or `~/.config/containers/auth.json`

## Security Best Practices

1. **Use Fine-Grained Tokens**: Consider using fine-grained personal access tokens for better security control
2. **Set Expiration Dates**: Don't create tokens that never expire
3. **Rotate Tokens**: Regularly rotate your tokens
4. **Limit Scope**: Only grant the minimum required permissions
5. **Secure Storage**: Never commit tokens to version control
6. **Use Environment Variables**: Store tokens in environment variables or secret management systems

## Troubleshooting

### "unauthorized: authentication required" Error

- Verify token has correct scopes (`read:packages` at minimum)
- Check token hasn't expired
- Ensure correct username and token are used

### "denied: permission denied" Error

- Verify you have access to the repository
- Check if the package/image exists and is accessible
- Confirm token has necessary permissions for the operation

### Token Not Working After Creation

- Wait a few minutes - token activation can take time
- Try logging out and logging back in
- Verify you copied the entire token string

## Logout

When done or to clear credentials:

```bash
# Docker
docker logout ghcr.io

# Podman
podman logout ghcr.io
```

## Additional Resources

- [GitHub Container Registry Documentation](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Managing Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)
