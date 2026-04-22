# Rotate TLS Certificates

This runbook rotates the TLS certificates that terminate OpenStack API traffic on HAProxy and the internal message bus. These certificates have a one-year validity and must be rotated before they expire, otherwise the OpenStack APIs stop accepting TLS connections.

**Rotation cadence:** every 12 months. Rotation must complete before the `notAfter` date on `haproxy.pem`.

## Scope

**Covered by this runbook** — manual rotation required:

| Component | Certificate file | Purpose |
|---|---|---|
| HAProxy external | `haproxy.pem` | Public OpenStack API endpoint (Keystone, Nova, Neutron, Glance, …) |
| HAProxy internal | `haproxy-internal.pem` | Internal VIP endpoint |
| Backend | `backend-cert.pem` / `backend-key.pem` | TLS between HAProxy and OpenStack services |
| RabbitMQ | `rabbitmq-cert.pem` / `rabbitmq-key.pem` | AMQP TLS (client-server) |
| ProxySQL | `proxysql-cert.pem` / `proxysql-key.pem` | DB proxy TLS |

**Not covered by this runbook — no action required:**

- **IaaS Console and observability ingresses** (`console.*`, `grafana.*`, `prometheus.*`, `loki.*`). These run in the management cluster and are issued by cert-manager against Let's Encrypt using DNS-01 against Azure DNS. cert-manager renews them automatically ~30 days before expiry. Configuration lives in the `iaas-console` role (`setup-cluster-issuer.yml`) and is parameterised per environment through `iaas_console_tls_*` and `obs_tls_*` inventory variables. See [HTTPS with Let's Encrypt setup](../../../tls/https-letsencrypt-setup.md) for the one-time bootstrap.
- **Root CA** (`certificates/ca/root.crt`, `certificates/private/root/`). Rotating the CA forces every client to refresh its trust bundle and is out of scope here. Schedule separately well before CA expiry.
- **Octavia CAs** Long-lived and not consumed by external clients. Rotate only as part of a full Octavia redeployment.

**Environments where this applies:** environments with `openstack_tls.enabled: true` in the inventory.

## Prerequisites

- [ ] VPN access to the target environment
- [ ] Ansible Vault password for the target environment
- [ ] Access to the bastion host with the platform deployment bundle (`platform-setup.sh`)
- [ ] Maintenance window: expect a brief API interruption (seconds) during HAProxy reload

:::note

All commands below assume you are on the bastion host. The deployment container is entered with `./platform-setup.sh --shell`. Replace `<env>` with your target environment.

:::

## Step 1: Check the current expiry

From your workstation, over VPN, read the cert HAProxy is actually serving (internal_fqdn can be obtained from the configuration inventory):

```bash
echo | openssl s_client -connect <internal_fqdn>:5000 -servername <internal_fqdn> 2>/dev/null \
  | openssl x509 -noout -subject -issuer -startdate -enddate
```

Record the `notAfter` date. Proceed only if it is within your rotation window (recommended: within 60 days of expiry, or any earlier moment triggered by an incident).

## Step 2: Remove the leaf certificate files

Rotation works by deleting the current leaf files so they get regenerated on the next reconfigure. **Do not delete the CA or its private key** — doing so would rotate the CA and invalidate every client trust store.

Copy the installer and installation assets into the bastion:

```bash
cd config/certificates

# Remove leaf certs — these will be regenerated
rm -f haproxy.pem \
      haproxy-internal.pem \
      backend-cert.pem backend-key.pem \
      rabbitmq-cert.pem rabbitmq-key.pem \
      proxysql-cert.pem proxysql-key.pem

# Sanity check: the CA must still be present
ls ca/root.crt private/root/
```

:::warning

If `ca/root.crt` or `private/root/` is missing after this step, **stop**. Restore those files from git before continuing — otherwise the next step will mint a brand-new CA and every OpenStack client will break until it is re-seeded with the new CA.

:::

## Step 3: Regenerate and apply

From the bastion, run a [reconfigure](./updates/CONFIGURATION). This regenerates the deleted leaves (certificates) against the existing CA, re-templates `globals.yml`, and rolls necessary services with the new cert material.

```bash
./platform-setup.sh --reconfigure
```

Expect the run to take several minutes. API traffic may see brief TLS handshake failures during the reload window.

:::note

`--reconfigure` is marked experimental in `scripts/deployment/README.md`, but "certificate updates and rotation" is listed as a supported use case. Keep the log (`logs/main-*.log`) for audit.

:::

## Step 4: Commit the new cert files

The regenerated cert files are written to `config/certificates/` and vault-encrypted in place. Follow the designated configuration management policy to store / backup the new configuration (with the new secrets).

```bash
cd ~/release/infra-management/<env>
git status config/certificates/
git add config/certificates/
git commit -m "chore(<env>): rotate HAProxy/RabbitMQ/ProxySQL TLS certs"
```

## Verify

Confirm the new certificate is being served:

```bash
echo | openssl s_client -connect <internal_fqdn>:5000 -servername <internal_fqdn> 2>/dev/null \
  | openssl x509 -noout -subject -issuer -startdate -enddate
```

Checklist:

- [ ] `notBefore` matches today (or within the last few minutes)
- [ ] `notAfter` is ~365 days in the future
- [ ] `issuer` matches the pre-rotation value — **not** a new one (same CA)
- [ ] `openstack --os-cloud <env> token issue` succeeds from the bastion
- [ ] IaaS Console, Horizon, and Grafana still load without TLS errors
- [ ] No services in `openstack status` are stuck restarting
- [ ] `rabbitmqctl cluster_status` (inside the rabbitmq container on any controller) shows all nodes healthy

Repeat the `openssl s_client` check against the other API ports if you want broader coverage:

```bash
for port in 5000 8774 9292 9696 8776 9511 6385; do
  echo "=== port $port ==="
  echo | openssl s_client -connect <internal_fqdn>:$port -servername <internal_fqdn> 2>/dev/null \
    | openssl x509 -noout -enddate
done
```

## Rollback

The pre-rotation cert files are the ones currently committed in git. If the reconfigure fails, or if services regress after rotation:

1. Restore the previous cert files from the configuration management system:

2. Re-run the reconfigure to push the old material back into place:

   ```bash
   ./platform-setup.sh --reconfigure
   ```

3. Re-verify with the `openssl s_client` command from Step 1. The `notAfter` date should match the pre-rotation value.

If the CA itself was accidentally regenerated (Step 2 warning), recovery requires:

- Restoring `ca/` and `private/root/` from the configuration management system.
- Regenerating the leaves against the restored CA (delete leaves, `--reconfigure`)
- **Not** touching client trust stores, since the restored CA is the one they already trust
