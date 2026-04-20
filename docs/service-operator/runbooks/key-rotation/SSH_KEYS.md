# Rotate SSH Keys


This runbook rotates the Ed25519 key pair used to access all infrastructure hosts (bare-metal nodes, management cluster VMs, Hedgehog fabric). Rotation uses a zero-downtime approach: the new key is added to all hosts before the old key is removed.

**Rotation cadence:** every 6 months, aligned with the AI Factory release cycle.

## Prerequisites

- [ ] Previous keypair for accessing hosts and to rollback if necessary (on the scripts of this runbook this key appear on  `~/.ssh/old_key.pem`).
- [ ] OpenStack admin credentials (`infra-management/<env>/config/admin-openrc.sh`)

:::note

OpenStack commands can be run from your local workstation or from the management container (`platform-setup.sh --shell`).

:::

## Step 1: Generate a new key pair

```bash
ssh-keygen -t ed25519 -f ~/.ssh/new_key.pem -C "<comment to identify the key>" -N ""
```

This creates:
- `~/.ssh/new_key.pem` — new private key
- `~/.ssh/new_key.pem.pub` — new public key


## Step 2: Add the new public key to all hosts

SSH into each host with the **old** key and append the new public key to `authorized_keys`. The old key remains active throughout this step.

**Bare-metal nodes and management cluster VMs (`ubuntu` user):**


```bash
NEW_KEY=$(cat ~/.ssh/new_key.pem.pub)

for HOST in \
  control0 control1 control2 \
  compute0 compute1 \
  storage0 storage1 storage2 \
  gpu0 gpu1; do
  ssh -i ~/.ssh/old_key.pem ubuntu@${HOST} \
    "echo '${NEW_KEY}' >> ~/.ssh/authorized_keys"
done
```

Replace the host list with the actual hostnames for your environment.

**Management cluster VMs** (OpenStack instances — list them first):

```bash
source infra-management/<env>/config/admin-openrc.sh
openstack server list --all-projects --key-name management-key -c ID -c Name -c Networks
```

Then for each VM:

```bash
ssh -i ~/.ssh/old_key.pem ubuntu@<VM-IP> \
  "echo '${NEW_KEY}' >> ~/.ssh/authorized_keys"
```

**Hedgehog control node (`core` user):**

```bash
ssh -i ~/.ssh/old_key.pem core@<hedgehog-control-ip> \
  "echo '${NEW_KEY}' >> ~/.ssh/authorized_keys"
```

## Step 3: Verify connectivity with the new key

Confirm the new key works on every host before removing the old one. **Do not proceed if any host fails.**

```bash
# Bare-metal node example
ssh -i ~/.ssh/new_key.pem ubuntu@<host> "hostname"

# Management cluster VM example
ssh -i ~/.ssh/new_key.pem ubuntu@<VM-IP> "hostname"

# Hedgehog control node
ssh -i ~/.ssh/new_key.pem core@<hedgehog-control-ip> "hostname"
```

## Step 4: Remove the old public key from all hosts

Once all hosts are confirmed reachable with the new key, remove the old public key. Connect with the **new** key.

```bash
OLD_KEY=$(ssh-keygen -y -f ~/.ssh/old_key.pem)

for HOST in \
  control0 control1 control2 \
  compute0 compute1 \
  storage0 storage1 storage2 \
  gpu0 gpu1; do
  ssh -i ~/.ssh/new_key.pem ubuntu@${HOST} \
    "grep -v '${OLD_KEY}' ~/.ssh/authorized_keys > /tmp/ak && mv /tmp/ak ~/.ssh/authorized_keys"
done
```

For management cluster VMs and the Hedgehog control node, repeat the same pattern with the appropriate user and IP.

Verify only the new key remains on a sample host:

```bash
ssh -i ~/.ssh/new_key.pem ubuntu@<host> "cat ~/.ssh/authorized_keys"
```

## Step 5: Update the OpenStack keypair

Management cluster VMs are launched with the Nova keypair `management-key`. Delete the old keypair and register the new public key so future VMs use the new key.

```bash
source infra-management/<env>/config/admin-openrc.sh

openstack keypair delete management-key
openstack keypair create --public-key ~/.ssh/new_key.pem.pub management-key
```

Confirm the update:

```bash
openstack keypair show management-key
```

:::note

This only affects VMs created after this point. Existing management cluster nodes already have the new key in `authorized_keys` from Step 2.

:::


## Verify

Run a final spot-check using the renamed key:

```bash
ssh -i ~/.ssh/new_key.pem ubuntu@<host> "hostname"
```

Verify the checklist:

- [ ] `openstack keypair show management-key` shows the new fingerprint
- [ ] SSH succeeds on all bare-metal nodes with `~/.ssh/new_key.pem`
- [ ] SSH succeeds on all management cluster VMs with `~/.ssh/new_key.pem`
- [ ] `~/.ssh/authorized_keys` on all hosts contains only the new key

## Rollback

The old key is still active on all hosts until Step 4 completes. To abort before Step 4:

1. Stop the procedure.
2. Remove the new public key from any hosts where it was already added:

   ```bash
   NEW_KEY=$(cat ~/.ssh/new_key.pem.pub)

   ssh -i ~/.ssh/new_key.pem ubuntu@<host> \
     "grep -v '${NEW_KEY}' ~/.ssh/authorized_keys > /tmp/ak && mv /tmp/ak ~/.ssh/authorized_keys"
   ```

3. Delete the new key files:

   ```bash
   rm ~/.ssh/new_key.pem ~/.ssh/new_key.pem.pub
   ```

If Step 4 already completed (old key removed) but a later step failed, recover the old private key re-add the old public key to any affected hosts, then resume from the failed step.
