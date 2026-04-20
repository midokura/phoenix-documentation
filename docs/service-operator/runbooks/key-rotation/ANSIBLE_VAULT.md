# Rotate Ansible Vault Passwords

Rotating the Ansible Vault password

This runbook rotates the Ansible Vault password used to encrypt secrets at rest for an AI Factory environment. Each environment has its own independent vault password, so run this procedure once per environment.

**Rotation cadence:** every year.

## What is protected by the vault password

The following file types are encrypted at rest. Step 3 is the authoritative enumeration — this table describes what to expect to find in the file.

| File pattern | Contents |
|---|---|
| `*-openrc.sh`, `*-openrc-system.sh` | OpenStack credentials |
| `clouds.yaml` | OpenStack cloud configuration |
| `*.keyring` | Ceph client keyrings |
| `**/*.pem`, `**/*.crt`, `**/*.csr`, `**/*.key` | TLS certificates (HAProxy, Octavia CA) |
| `passwords.yml` | All OpenStack service passwords |
| Management cluster kubeconfig (if vault-encrypted) | Management cluster credentials |

## Prerequisites

- [ ] Current vault password accessible from your credential store
- [ ] `ansible-vault` available in your shell

```bash
ansible-vault --version
```

## Step 1: Save the old vault password to a temporary file

Write the current vault password to a temporary file. The file must **not** have a trailing newline.

```bash
printf '%s' '<old-vault-password>' > /tmp/old_vault_pass.txt
chmod 600 /tmp/old_vault_pass.txt
```

## Step 2: Generate a new vault password

```bash
openssl rand -base64 32 | tr -d '\n' > /tmp/new_vault_pass.txt
chmod 600 /tmp/new_vault_pass.txt
```

Verify it is a single line with no newline:

```bash
cat /tmp/new_vault_pass.txt
```

## Step 3: Identify all vault-encrypted files

Set `CLUSTER_DIR` to the path of your environment's cluster directory, then find all vault-encrypted files within it:

```bash
CLUSTER_DIR="<path-to-cluster-directory>"

VAULT_FILES=$(find "${CLUSTER_DIR}" -type f \
  -exec grep -l '^\$ANSIBLE_VAULT' {} +)

echo "${VAULT_FILES}"
```

Review the list before proceeding. If any unexpected files appear, investigate before continuing.

## Step 4: Re-key all encrypted files

```bash
echo "${VAULT_FILES}" | xargs -d '\n' ansible-vault rekey \
  --vault-password-file /tmp/old_vault_pass.txt \
  --new-vault-password-file /tmp/new_vault_pass.txt
```

`ansible-vault rekey` replaces the encryption key in-place without touching the plaintext.

If the management cluster kubeconfig is stored **outside** `${CLUSTER_DIR}` (for example, the operator's local `~/.kube/config`), re-key it separately:

```bash
KUBECONFIG_PATH="<path-to-kubeconfig>"

grep -q '^\$ANSIBLE_VAULT' "${KUBECONFIG_PATH}" && \
  ansible-vault rekey \
    --vault-password-file /tmp/old_vault_pass.txt \
    --new-vault-password-file /tmp/new_vault_pass.txt \
    "${KUBECONFIG_PATH}"
```

## Step 5: Verify decryption with the new password

Spot-check one or two files to confirm the new password works:

```bash
ansible-vault view \
  --vault-password-file /tmp/new_vault_pass.txt \
  "${CLUSTER_DIR}/config/passwords.yml" | head -5

ansible-vault view \
  --vault-password-file /tmp/new_vault_pass.txt \
  "${CLUSTER_DIR}/config/admin-openrc.sh"
```

:::note

If `ansible-vault view` fails with "ERROR! Decryption failed", the re-key did not apply to that file. Restore the file to its state **before any re-key was attempted** (not a partially re-keyed version) and retry Step 4 for that file only.

:::

## Step 6: Store the new vault password

Store the contents of `/tmp/new_vault_pass.txt` in your credential management system before persisting the artifacts. This ordering ensures the new password is never lost even if the persistence step fails.

## Step 7: Persist the re-keyed artifacts

Persist the re-keyed files according to your operator workflow (for example, commit to your configuration repository, upload to your artifact store).

## Step 8: Clean up temporary password files

```bash
rm -f /tmp/old_vault_pass.txt /tmp/new_vault_pass.txt
```

## Verify

- [ ] All files from Step 3 decrypt successfully with the new password
- [ ] New password stored in your credential management system
- [ ] Old password file removed from disk
- [ ] Re-keyed artifacts persisted
- [ ] Every re-keyed file decrypts successfully with the new password:

  ```bash
  echo "${VAULT_FILES}" | while IFS= read -r f; do
    ansible-vault view --vault-password-file /tmp/new_vault_pass.txt "$f" > /dev/null \
      && echo "OK:   $f" \
      || echo "FAIL: $f"
  done
  ```

  All lines must print `OK`. Any `FAIL` means the re-key was not applied to that file — restore it to its pre-rotation state and retry Step 4 for that file only.

## Using the new password with Ansible playbooks

Pass the new vault password when running any playbook that touches the environment:

```bash
# Regenerate passwords.yml (re-encrypts passwords.yml only)
ansible-playbook ansible/playbooks/generate-openstack-config.yml \
  -i ansible/inventories/<env>/inventory.yml \
  --extra-vars "cluster_directory=${CLUSTER_DIR} vault_password_file=/tmp/new_vault_pass.txt"

# Encrypt all artifacts (after manual config changes)
ansible-playbook ansible/playbooks/encrypt.yml \
  --extra-vars "vault_password_file=/tmp/new_vault_pass.txt cluster_directory=${CLUSTER_DIR}"
```

## Rollback

Step 6 (store new password) intentionally precedes Step 7 (persist artifacts): if persistence fails you can retry without risk of losing the new password; if Step 6 fails, nothing has been published yet and the old password is still valid.

- **Failure before Step 6:** old password is still valid. Restore all files to their state before any re-key was attempted and retry from Step 4.
- **Failure at Step 7 or later:** new password is stored. Use it going forward and retry the failed step.
