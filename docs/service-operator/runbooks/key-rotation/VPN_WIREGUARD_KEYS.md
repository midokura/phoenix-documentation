---
sidebar_position: 4
---

# Rotate WireGuard VPN Keys

This runbook rotates the WireGuard private key for a tenant VPN server. Rotation is zero-touch on the server side: update the Barbican secret and the server picks it up automatically within 60 seconds — no SSH access, no restart, no signal required.

**Rotation cadence:** every 12 months, or immediately following a suspected key compromise.

:::danger Client coordination is mandatory before rotating

**Every client loses VPN connectivity when the server key rotates.** Their WireGuard config becomes invalid the moment the new private key is applied, and they cannot reconnect until they re-import their configuration.

**You must:**

1. Contact all affected users by email before starting (see [Step 1](#step-1-contact-all-clients) below).
2. Agree on a maintenance window with them.
3. Do not proceed until you have confirmation from all clients that they are aware of the downtime and ready to reconfigure.

There is no way to rotate keys transparently. Skipping this step will result in users being locked out of their tenant network without warning.

:::

## How rotation works

The VPN server polls Barbican for the private key every 60 seconds. When the key changes, it is applied to the live interface automatically — no restart needed.

The `Get User VPN Config` API serves updated client configurations once the public key is updated. Clients must re-download and re-import their WireGuard config manually — this does not happen automatically on their devices.

## Prerequisites

- [ ] All affected clients have been contacted and have confirmed the maintenance window (see Step 1)
- [ ] OpenStack CLI configured for the target environment (`openstack --os-cloud <env> token issue` succeeds)
- [ ] The tenant UUID (`<tenant_id>`) — available from the IaaS Console or `openstack project list`
- [ ] `wg` and `jq` installed locally
- [ ] IaaS Console API URL and operator JWT token (from the Operator tab in the IaaS UI)

## Step 1: Contact all clients

Email all users who have VPN access to the tenant. Include:

- The scheduled maintenance window (date and time with timezone)
- That their VPN connection will be interrupted and will not work until they reconfigure it
- Instructions to follow after the rotation: they must re-download their VPN configuration from the portal and re-import it into WireGuard (point them to the [VPN Configuration guide for users](../../../user/VPN_CONFIGURATION.md))

**Do not proceed until you have received confirmation from all clients.**

## Step 2: Verify Barbican is available

```bash
openstack --os-cloud <env> secret list
```

The command must return without error. If it returns an HTTP error or connection failure, do not proceed — the rotation depends on Barbican being accessible to the VPN server.

## Step 3: Generate a new WireGuard keypair

```bash
wg genkey | tee private.key | wg pubkey > public.key
NEW_PUBLIC_KEY="$(cat public.key)"   # needed in Steps 5 and 7
```

Keep `private.key` and `public.key` in a secure location. Delete them after the rotation is confirmed.

## Step 4: Update the Barbican secret

The secret is stored under the deterministic name `vpn-private-key-<tenant_id>`. Delete the old secret and store the new one under the same name:

```bash
# Look up and delete the old secret
openstack --os-cloud <env> secret delete \
  $(openstack --os-cloud <env> secret list \
    --name vpn-private-key-<tenant_id> \
    -f value -c "Secret href")

# Store the new private key
openstack --os-cloud <env> secret store \
  --name vpn-private-key-<tenant_id> \
  --payload "$(cat private.key)"

# Confirm it is stored
openstack --os-cloud <env> secret list --name vpn-private-key-<tenant_id>
```

:::note

The secret name must be exactly `vpn-private-key-<tenant_id>` — this is the name `user-sync-agent` uses when looking up the secret by name.

:::

## Step 5: Update the server public key in Swift

The VPN configuration is stored in Swift as a JSON object at `config/vpn-users.json` inside a container named after the tenant ID. Download it, update the public key, and re-upload it.

```bash
# Download the current config
openstack --os-cloud <env> object save \
  --file vpn-users.json \
  <tenant_id> config/vpn-users.json

# Verify the current content
cat vpn-users.json
```

The file looks like:

```json
{
  "vpn_server_public_key": "<old-public-key>",
  "users": [...]
}
```

Replace `vpn_server_public_key` with the new public key from Step 3:

```bash
jq --arg key "$NEW_PUBLIC_KEY" '.vpn_server_public_key = $key' \
  vpn-users.json > vpn-users-updated.json

# Verify the change before uploading
cat vpn-users-updated.json
```

Upload the updated file back to Swift:

```bash
openstack --os-cloud <env> object create \
  --name config/vpn-users.json \
  <tenant_id> vpn-users-updated.json

rm -f vpn-users.json vpn-users-updated.json
```

## Step 6: Wait for automatic rotation

The VPN server reconcile loop runs every 60 seconds. It fetches the key from Barbican, detects the change, and applies it live. No action is required on the server.

Wait at least 60 seconds before proceeding.

:::note Expected alert during rotation

**Why the delete is necessary:** Barbican secrets are immutable — their payload cannot be changed after creation. The only way to store a new key is to delete the old secret and create a fresh one.

This means there is an unavoidable gap between the delete and the recreate in Step 4 where no secret exists under the name `vpn-private-key-<tenant_id>`. If the reconcile loop (every 60 seconds) fires during this gap, it will fail to resolve the secret by name and log a `BarbicanFetchError`. This will trigger a **Barbican fetch error alert** — this is expected and can be silenced for the duration of the rotation.

**The WireGuard tunnel is not affected.** The VPN server catches the error, leaves the existing key untouched, and retries on the next cycle. Peers stay connected throughout.

**Execute the delete and store commands back-to-back without delay.** The longer the gap between them, the higher the chance the reconcile loop fires during it and triggers the alert. Running both commands in quick succession (as shown in Step 4) keeps the window to under a second in practice.

If the alert persists for more than 2 reconcile cycles (>2 minutes) after Step 4 is complete, something is wrong — see [Troubleshooting](#troubleshooting).

:::

## Step 7: Notify clients to reconfigure

The server key has changed. Every client's existing WireGuard configuration is now invalid. Email all affected users and instruct them to re-download their VPN configuration from the portal and re-import it into WireGuard.

Point them to the [VPN Configuration guide](../../../user/VPN_CONFIGURATION.md) for platform-specific steps.

## Step 8: Verify connectivity

Once at least one client has reconfigured, SSH into the VPN server and run:

```bash
sudo wg show
```

Checklist:

- [ ] `[Interface] public key` matches the new public key from Step 3
- [ ] `latest handshake` timestamps are recent for reconnected peers
- [ ] `ping <tenant-vpn-gateway-ip>` succeeds from a reconfigured peer
- [ ] All clients confirm they have successfully reconnected
- [ ] Delete the local key files generated in Step 3: `rm -f private.key public.key`

## Rollback

If the new key does not take effect or connectivity cannot be restored:

1. Restore the old private key from your secrets manager, or generate a fresh one if unavailable.
2. Repeat Step 4 to replace the Barbican secret.
3. Repeat Step 5 to update `vpn_server_public_key` in Swift.
4. Wait 60 seconds and re-verify.
5. Re-run Step 7 — clients will need new config scripts again.

## Troubleshooting

**`openstack secret delete` returns "No secret found"**

The secret may already have been deleted, or the name is wrong. Verify:

```bash
openstack --os-cloud <env> secret list --name vpn-private-key-<tenant_id>
```

If empty, skip the delete and go straight to `secret store`.

**Barbican returns 403 for the VPN server app credential**

The application credential for the tenant may lack `secrets:get` permission in the Barbican policy. Check with the platform team — a role assignment update may be required.
