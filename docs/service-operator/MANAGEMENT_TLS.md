# Management TLS

Configuring Let's Encrypt certificates via Azure DNS for IaaS Console and OBS

This document explains how to configure cert-manager to issue Let's Encrypt certificates using the DNS-01 challenge with Azure DNS.

## Azure DNS

The playbooks construct service hostnames from the inventory variables:

```yaml
management_cluster:
  public: "119.15.114.17"

cluster_name: phoenix.bcn
cluster_public_domain: midocloud.net
```

For example, the IaaS Console host resolves to:

```
iaas_console_host: "console.{{ cluster_name }}.{{ cluster_public_domain }}"
```

which evaluates to `console.phoenix.bcn.midocloud.net`.

You must add a **Recordset** in Azure DNS for each service subdomain in your `{{ cluster_public_domain }}` **DNS zone**, pointing to `{{ management_cluster.public }}`:

| Subdomain | A record value |
|---|---|
| `console.{{ cluster_name }}.{{ cluster_public_domain }}` | `{{ management_cluster.public }}` |
| `grafana.{{ cluster_name }}.{{ cluster_public_domain }}` | `{{ management_cluster.public }}` |
| `loki.{{ cluster_name }}.{{ cluster_public_domain }}` | `{{ management_cluster.public }}` |
| `prometheus.{{ cluster_name }}.{{ cluster_public_domain }}` | `{{ management_cluster.public }}` |

## DNS Forwarding for Internal Domains

OpenWrt dnsmasq forwards ACME challenge queries to a public resolver so cert-manager can publish TXT records to Azure DNS and Let's Encrypt can resolve them.

For example,

```yaml
openwrt_dhcp_dnsmasq_server: ...
  - "/_acme-challenge.console.{{ cluster_name }}.{{ cluster_public_domain }}/1.1.1.1"
  - "/_acme-challenge.grafana.{{ cluster_name }}.{{ cluster_public_domain }}/1.1.1.1"
  - "/_acme-challenge.loki.{{ cluster_name }}.{{ cluster_public_domain }}/1.1.1.1"
  - "/_acme-challenge.prometheus.{{ cluster_name }}.{{ cluster_public_domain }}/1.1.1.1"
```

Base domains resolve internally via the management cluster's CoreDNS.

## Prerequisites

- Azure subscription with DNS zones
- A domain registered in Azure DNS

## Step 1: Create an Azure DNS Zone

Create a DNS zone in the Azure Portal and note the resource group name.

## Step 2: Create a Service Principal

```bash
SUSCRIPTION_ID=$(az account show --query id -o tsv)
RESOURCE_GROUP="<your-resource-group-name>"  # e.g., "DNS-Management"
APP_NAME="<your-app-name>" # e.g., "DNS-CertManager"

SP=$(az ad sp create-for-rbac \
  --name "$APP_NAME" \
  --role "Contributor" \
  --scopes /subscriptions/$SUSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP)

AZURE_TENANT_ID=$(echo "$SP" | jq -r '.tenant')
AZURE_SP_CLIENT_ID=$(echo "$SP" | jq -r '.appId')
AZURE_SP_PASSWORD=$(echo "$SP" | jq -r '.password')
```

## Step 3: Configure in Inventory

Add these variables to your inventory:

```yaml
iaas_console_cert_manager_email: "<your-email>"
iaas_console_cert_manager_azure_subscription_id: "$SUSCRIPTION_ID"
iaas_console_cert_manager_azure_tenant_id: "$AZURE_TENANT_ID"
iaas_console_cert_manager_azure_sp_client_id: "$AZURE_SP_CLIENT_ID"
iaas_console_cert_manager_azure_sp_password: !vault |
  <vault-encrypted-password>
iaas_console_cert_manager_azure_dns_resource_group: "$RESOURCE_GROUP"
iaas_console_tls_enabled: true
iaas_console_tls_cluster_issuer: "letsencrypt-staging"
obs_tls_enabled: true
obs_tls_cluster_issuer: "letsencrypt-staging"
```

Encrypt the service principal password with `ansible-vault` and replace `<vault-encrypted-password>` with the result.

## Step 4: Point Your Domain to Azure DNS

If your domain is registered elsewhere, update the NS records at your registrar to point to the Azure DNS name servers.

## Deploy

Running the IaaS Console deployment will automatically configure TLS using the Let's Encrypt staging environment, which has more flexible rate limits. Once you have verified that things are working, switch both `iaas_console_tls_cluster_issuer` and `obs_tls_cluster_issuer` to `"letsencrypt-prod"`.
