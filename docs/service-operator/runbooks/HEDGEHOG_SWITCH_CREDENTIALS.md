# Hedgehog switch credentials update

Updating switch user credentials in the Hedgehog fabricator spec

## Purpose

After the Hedgehog fabric is provisioned, the fabricator CRD still holds the default
switch user credentials from the installer ISO. Patching the spec before switch installation
ensures switches receive operator-defined credentials during SONiC provisioning.

Two sets of credentials are configured:

- **`admin`** (role: admin) and **`op`** (role: operator) — users on each managed switch
- **control node user** — the fabricator's record of the Hedgehog VM `core` user; updating
  this does not affect OS-level credentials but keeps the spec consistent with the manual
  changes made via `update-ssh-keys` during bootstrap

The fabricator reconciler propagates changes automatically; no additional trigger is needed.

:::note

As of v26.1.0, the bootstrap playbook automatically patches the Fabricator CRD with
operator-defined switch credentials using the `hedgehog.switch_users` inventory variable,
before any switch is booted. **This runbook is no longer required during initial bootstrap.**
Use it only to rotate switch credentials on an existing deployment.

:::

## When to run

On an existing deployment, when rotating switch credentials after initial bootstrap.
No re-provisioning is needed: the switch agent re-applies the users from the fabric config
on its next reconcile, so installed switches pick up the new credentials.

Alternatively, update `hedgehog.switch_users` in the inventory and re-run the bootstrap
playbook, which patches the same fields.

## Prerequisites

- [ ] SSH access to the Hedgehog control node VM as `core`
- [ ] New passwords chosen for the `admin` and `op` switch users
- [ ] SSH public keys to authorise on switches (collected in Step 2)

## Step 1: SSH to the Hedgehog control node

From the bastion node:

```bash
ssh core@<hedgehog-control-ip>
```

Steps 2–5 run inside this SSH session.

## Step 2: Collect the current authorized keys

The same keys registered on the Hedgehog VM should be authorized on the switches.
List them, excluding comment lines:

```bash
cat /home/core/.ssh/authorized_keys | grep -v '#'
```

Copy the output — these are the values for the `authorizedKeys` arrays in Steps 4 and 5.

## Step 3: Generate password hashes

`openssl passwd -5` produces a SHA-256 crypt hash (the `$5$…` format used in
`/etc/shadow`). Generate one hash per switch user:

```bash
openssl passwd -5 <new-admin-password>
openssl passwd -5 <new-op-password>
```

Note each hash; the full `$5$…` string is used verbatim in the patch commands.

:::warning

Each hash must be exactly 63 characters: `$5$<16-char salt>$<43-char hash>`. The switch
agent only treats a 63-character `$5$` value as a hash. Anything else, such as a
`$5$rounds=…$` hash (for example from Python `passlib`, or Ansible `password_hash`
without `rounds=5000`), is set on the switch as the literal plaintext password.
Check with `echo -n '<hash>' | wc -c`.

:::

For Step 5 (control node consistency patch), use the hash of the password already set on
the `core` user during the [VM credential bootstrap](../HEDGEHOG_VM_CREDENTIALS) — not a
new password. Generate it now if it was not noted at that time:

```bash
openssl passwd -5 <core-user-password-from-bootstrap>
```

## Step 4: Update switch user credentials

Patch both switch users in a single call. Use a heredoc to avoid shell expansion of the
`$` characters in the password hashes:

```bash
kubectl patch fabricators.fabricator.githedgehog.com default -n fab --type=merge \
  -p "$(cat <<'EOF'
{
  "spec": {
    "config": {
      "fabric": {
        "defaultSwitchUsers": {
          "admin": {
            "role": "admin",
            "password": "$5$<admin-hash>",
            "authorizedKeys": ["ssh-ed25519 AAAA...", "ssh-ed25519 AAAA..."]
          },
          "op": {
            "role": "operator",
            "password": "$5$<op-hash>",
            "authorizedKeys": ["ssh-ed25519 AAAA...", "ssh-ed25519 AAAA..."]
          }
        }
      }
    }
  }
}
EOF
)"
```

## Step 5: Update the control node user in the fabricator spec

This keeps the fabricator's record consistent with the credentials set on the VM during
bootstrap. It does **not** modify the OS-level `core` user account.

```bash
kubectl patch fabricators.fabricator.githedgehog.com default -n fab --type=merge \
  -p "$(cat <<'EOF'
{
  "spec": {
    "config": {
      "control": {
        "defaultUser": {
          "password": "$5$<control-hash>",
          "authorizedKeys": ["ssh-ed25519 AAAA...", "ssh-ed25519 AAAA..."]
        }
      }
    }
  }
}
EOF
)"
```

## Step 6: Verify the patch was applied

```bash
kubectl describe fabricators default -n fab
```

In the output, locate the `spec.config.fabric.defaultSwitchUsers` and
`spec.config.control.defaultUser` sections. Confirm that the `password` fields show the
new hashes (not the ISO defaults) and that `authorizedKeys` lists all expected public keys.

## Verify

- [ ] `kubectl describe fabricators default -n fab` output shows updated password hashes for `admin` and `op`
- [ ] `kubectl describe fabricators default -n fab` output shows updated `authorizedKeys` for `admin` and `op`
- [ ] Fabricator `control.defaultUser` reflects the keys set on the VM during bootstrap
- [ ] Each switch accepts SSH login as `admin` and `op` with the new passwords and the authorised keys

