# Hedgehog VM credentials update

Updating the `core` user password and SSH authorized keys on the Hedgehog control node VM

## Purpose

The Hedgehog control node VM runs Flatcar Linux. Flatcar manages SSH authorized keys
through the `update-ssh-keys` tool — direct edits to `~/.ssh/authorized_keys` are
overwritten on every reboot because Flatcar regenerates that file from its registered
key sources. Use `update-ssh-keys` for all key changes.

This procedure is performed via `virsh console` on the hypervisor host. It must be
carried out during the bootstrap process, while the `hedgehog-controller` Ansible play
is waiting for SSH access (see
[Operator Overview](../OPERATOR_OVERVIEW#hardware-setup)).

## Prerequisites

- [ ] Console access on the hypervisor host running the Hedgehog VM
- [ ] The **environment SSH public key** — the public half of the key referenced by
  `ansible_ssh_private_key_file` in `inventory.yml` for the `hedgehog_control` host
  group (required to unblock Ansible's SSH wait)
- [ ] SSH public keys for any individual operators who need direct access

## Step 1: Open a console session

On the hypervisor host:

```bash
virsh console <hedgehog-vm>
```

Steps 2–6 are run inside this console as the `core` user.

## Step 2: Change the `core` user password

```bash
sudo passwd core
```

Enter the new password when prompted.

## Step 3: Identify the provisioning key

```bash
update-ssh-keys -l
```

At this point only one key is registered — the bootstrap key baked into the installer
ISO. Its name may vary; it will be the **only** entry listed. Note the name; it will
be removed in Step 6.

## Step 4: Add the environment SSH key and any operator keys

Add the environment SSH key first, using a recognisable name (for example, the
environment name):

```bash
echo "ssh-ed25519 AAAA... comment" | update-ssh-keys -a <environment-key-name>
```

Then repeat for each operator who needs direct access, using the operator's username
as the key name:

```bash
echo "ssh-ed25519 AAAA... comment" | update-ssh-keys -a <operator-name>
```

After each addition, confirm the key was registered:

```bash
update-ssh-keys -l
```

## Step 5: Exit the console and verify SSH access

Log out of the `core` session:

```bash
exit
```

Detach from the virsh console (back to the hypervisor shell):

```
Ctrl+]
```

From the bastion node, verify the environment key works — Ansible needs this to be
successful before its SSH wait unblocks:

```bash
ssh -i ~/.ssh/id_ed25519 core@<hedgehog-control-ip> "hostname"
```

Each operator should also verify their personal key at this point.

:::warning

Do not proceed to Step 6 until all keys have been verified. This is the last safe
rollback point.

:::

## Step 6: Remove the provisioning key

Re-enter the console:

```bash
virsh console <hedgehog-vm>
```

Remove the provisioning key using the name noted in Step 3:

```bash
update-ssh-keys -d <provisioning-key-name>
```

Confirm it is absent:

```bash
update-ssh-keys -l
```

One entry per registered key should remain; the provisioning key must not appear.

Exit and detach:

```bash
exit
```

(`Ctrl+]` to detach)

## Step 7: Reboot and verify persistence (post-bootstrap only)

:::warning

If you are following this runbook as part of the initial bootstrap, **stop here and
return to the deployment guide**. Rebooting the VM while the `hedgehog-controller`
Ansible play is still running will cause it to fail. Come back to this step after the
full bootstrap (including Phase 3) has completed.

:::

From the hypervisor host:

```bash
virsh shutdown <hedgehog-vm>
virsh start <hedgehog-vm>
```

Once the VM is back up, confirm SSH still works:

```bash
ssh -i ~/.ssh/id_ed25519 core@<hedgehog-control-ip> "hostname"
```

:::note

Changes made with `update-ssh-keys` persist across Flatcar reboots. Direct edits to
`~/.ssh/authorized_keys` do not — Flatcar regenerates that file from its registered
key sources on each boot.

:::

## Verify

- [ ] `sudo passwd core` completed without error
- [ ] `update-ssh-keys -l` shows all expected keys; the original provisioning key is absent
- [ ] SSH succeeds with the environment key and each operator key before reboot
- [ ] SSH succeeds with the environment key and each operator key after reboot

