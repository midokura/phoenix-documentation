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

## When to run

After Phase 3 of bootstrap (`--bootstrap --tags hedgehog-fabric`) completes and before
booting any switch into ONIE for SONiC installation. Updating after switch installation is
also possible, but requires re-provisioning the affected switches to apply the new credentials.

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

`openssl passwd -5` produces a SHA-512 crypt hash (the `$5$…` format used in
`/etc/shadow`). Generate one hash per switch user:

```bash
openssl passwd -5 <new-admin-password>
openssl passwd -5 <new-op-password>
```

Note each hash; the full `$5$…` string is used verbatim in the patch commands.

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
- [ ] Switches installed after this step accept SSH login with the authorised keys

