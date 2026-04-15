# Rotate SSH Keys

Rotating the `mido_infra` SSH key pair used for infrastructure access.

This runbook rotates the `mido_infra` Ed25519 key pair used by Ansible to access all infrastructure hosts (OpenStack nodes, management cluster VMs, Hedgehog fabric, router). Rotation uses a zero-downtime approach: the new key is distributed to all hosts before the old key is removed.

**Rotation cadence:** every 6 months, aligned with the AI Factory release cycle.

## Prerequisites

- [ ] Ansible container image built and available (`make image-build`)
- [ ] Vault password for the target environment available
- [ ] `mido_infra.pem` present at `~/.ssh/mido_infra.pem`
- [ ] Access to Bitwarden to update the stored key pair

## Step 1 — Generate a new key pair

```bash
ssh-keygen -t ed25519 -f ~/.ssh/mido_infra_new.pem -C "mido_infra" -N ""
```

This creates:
- `~/.ssh/mido_infra_new.pem` — new private key
- `~/.ssh/mido_infra_new.pem.pub` — new public key

## Step 2 — Add the new public key to all hosts

Use the **old** key to connect and add the new public key to `authorized_keys` on all hosts. The old key remains active throughout this step.

```bash
ansible all -i ansible/inventories/<env>/ \
  --private-key ~/.ssh/mido_infra.pem \
  -m ansible.posix.authorized_key \
  -a "user=ubuntu key='$(cat ~/.ssh/mido_infra_new.pem.pub)' state=present"
```

For the Hedgehog control node (user `core`):

```bash
ansible hedgehog_control -i ansible/inventories/<env>/ \
  --private-key ~/.ssh/mido_infra.pem \
  -m ansible.posix.authorized_key \
  -a "user=core key='$(cat ~/.ssh/mido_infra_new.pem.pub)' state=present"
```

## Step 3 — Verify connectivity with the new key

Confirm the new key works on all hosts before removing the old one:

```bash
ansible all -i ansible/inventories/<env>/ \
  --private-key ~/.ssh/mido_infra_new.pem \
  -m ansible.builtin.ping
```

All hosts must return `pong`. Do not proceed if any host fails.

## Step 4 — Remove the old public key from all hosts

```bash
OLD_KEY=$(ssh-keygen -y -f ~/.ssh/mido_infra.pem)

ansible all -i ansible/inventories/<env>/ \
  --private-key ~/.ssh/mido_infra_new.pem \
  -m ansible.posix.authorized_key \
  -a "user=ubuntu key='${OLD_KEY}' state=absent"
```

For the Hedgehog control node:

```bash
ansible hedgehog_control -i ansible/inventories/<env>/ \
  --private-key ~/.ssh/mido_infra_new.pem \
  -m ansible.posix.authorized_key \
  -a "user=core key='${OLD_KEY}' state=absent"
```

## Step 5 — Update the OpenStack Nova keypair

The management cluster VMs use a Nova keypair. Delete the old one and register the new public key:

```bash
# Source OpenStack credentials
source infra-management/<env>/config/admin-openrc.sh

# Replace the keypair
openstack keypair delete mido_infra
openstack keypair create --public-key ~/.ssh/mido_infra_new.pem.pub mido_infra
```

:::note

This only affects VMs created after this point. Existing management cluster nodes already have the new key in `authorized_keys` from Step 2.

:::

## Step 6 — Update the codebase

Replace the hardcoded public key in the following three files with the output of `cat ~/.ssh/mido_infra_new.pem.pub`:

| File | Location |
|------|----------|
| `ansible/inventories/openstack-lab.tyo/inventory.yml` | `ssh_public_key` var and `authorized_keys` list |
| `ansible/inventories/openstack-qa.bcn/inventory.yml` | `authorized_keys` list |
| `ansible/playbooks/roles/openwrt_configure/defaults/main.yml` | `ssh_public_keys` list |

Commit the changes:

```bash
git add ansible/inventories/openstack-lab.tyo/inventory.yml \
        ansible/inventories/openstack-qa.bcn/inventory.yml \
        ansible/playbooks/roles/openwrt_configure/defaults/main.yml
git commit -m "chore(ansible): rotate mido_infra SSH public key"
```

## Step 7 — Replace the local key file and update Bitwarden

```bash
mv ~/.ssh/mido_infra_new.pem ~/.ssh/mido_infra.pem
mv ~/.ssh/mido_infra_new.pem.pub ~/.ssh/mido_infra.pub
```

Update the `mido_infra SSH key` item in Bitwarden with the new private key file contents. Archive the old key entry — do not delete it immediately, in case rollback is needed.

## Verify

Run a final connectivity check using the renamed key:

```bash
ansible all -i ansible/inventories/<env>/ \
  --private-key ~/.ssh/mido_infra.pem \
  -m ansible.builtin.ping
```

All hosts must return `pong`.

## Rollback

If any step fails, the old key is still present in `~/.ssh/mido_infra.pem` and remains active on all hosts until Step 4 completes. To abort:

1. Stop the rotation procedure.
2. Remove the new public key from any hosts it was already added to:

   ```bash
   ansible all -i ansible/inventories/<env>/ \
     --private-key ~/.ssh/mido_infra.pem \
     -m ansible.posix.authorized_key \
     -a "user=ubuntu key='$(cat ~/.ssh/mido_infra_new.pem.pub)' state=absent"
   ```

3. Delete the new key files:

   ```bash
   rm ~/.ssh/mido_infra_new.pem ~/.ssh/mido_infra_new.pem.pub
   ```

If Step 4 already completed (old key removed) but Step 5 or later failed, restore from the Bitwarden archive and re-add the old public key to affected hosts manually.
