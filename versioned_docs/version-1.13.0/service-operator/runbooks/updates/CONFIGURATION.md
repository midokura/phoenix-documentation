# Update Environment Configuration

Configuring the environment.

This runbook covers how environment configuration is safely stored, how to change it, and how to apply changes.

## Downtime Impact

| Type | Services Affected | Estimated Downtime | Apply with |
|---|---|---|---|
| Major OpenStack settings (for example: enabling a new service or node) | All OpenStack services | ~20–40 min | `--tags openstack` |
| Minor OpenStack settings (for example: VIP address, TLS certificates) | Affected OpenStack services only (brief container restart) | ~5–10 min | `--reconfigure` |
| Management cluster, observability, and remote metrics variables | Management cluster (K3s), iaas-console, phoenix-observability, remote metrics scraper | ~10–20 min | `--update` |
| New default settings, glance images | Glance (images), Nova (flavors/quotas), Neutron (networks/bgp); optionally Ironic, Magnum, Designate (if enabled) | ~1–40 min | `--tags provision` |

## Encrypted Secrets

Secrets in the inventory (passwords, IPMI credentials, API keys) are [Ansible Vault](https://docs.ansible.com/projects/ansible/latest/cli/ansible-vault.html)-encrypted.

To view an encrypted variable:

```bash
ansible-vault view inventory.yml
```

To rotate the vault password:

```bash
ansible-vault rekey --new-vault-password-file ~/new-vault-key.txt inventory.yml
```

## How to Apply a Configuration Change

1. Edit `inventory.yml` with the new value.
2. Re-encrypt if you changed a secret block.
3. Apply with the appropriate option (see table).

   ```bash
   platform-setup.sh $OPTION
   ```

4. Verify services:

   ```bash
   platform-setup.sh --check

   platform-setup.sh --shell
   openstack service list
   openstack endpoint list
   ```
