---
sidebar_position: 30
---

# Azure SSO Setup Guide

Generating Azure SSO credentials for the IaaS Console.

This guide shows how to register an application in Azure Active Directory and obtain the credentials required to enable Azure Single Sign-On.

**Example hostname**: `https://console.phoenix-gpu.com`

## Outputs of This Guide

- **AZURE_CLIENT_ID**: The application (client) ID of your Azure app registration
- **AZURE_CLIENT_SECRET**: A client secret generated for the app registration
- **AZURE_TENANT_ID**: The directory (tenant) ID of your Azure AD tenant
- **AZURE_REDIRECT_URI**: Callback URL after login
  - Must be: `https://console.phoenix-gpu.com/api/auth/azure/callback`

## Prerequisites

- Azure account with permission to register applications in your Azure Active Directory tenant

## Setup Steps

### 1. Register an Application

1. Go to [Azure Portal](https://portal.azure.com/)
2. Use the top search bar to find and open **"App registrations"**
3. Click **"+ New registration"**
4. Fill in the form:
   - **Name**: Enter a name (for example, "IaaS Console")
   - **Supported account types**: Choose **"Accounts in this organizational directory only"** (single tenant) or the appropriate option for your organization
   - **Redirect URI**: Select **"Web"** and enter `https://console.phoenix-gpu.com/api/auth/azure/callback`
5. Click **"Register"**

### 2. Copy the Application and Tenant IDs

On the app registration's **Overview** page:

- **Application (client) ID** → this is your `AZURE_CLIENT_ID`
  - Example: `6088c67f-45dd-4bca-b08c-c6fbcd26c40b`
- **Directory (tenant) ID** → this is your `AZURE_TENANT_ID`
  - Example: `c36da824-36c5-4f3d-ae7c-a9e880782886`

### 3. Create a Client Secret

1. In the left sidebar, click **"Certificates & secrets"**
2. Under **"Client secrets"**, click **"+ New client secret"**
3. Enter a description (for example, "iaas-console") and choose an expiry
4. Click **"Add"**
5. Copy the **Value** immediately — this is your `AZURE_CLIENT_SECRET`

:::warning

The secret value is only shown once. Store it securely (vault-encrypted in your inventory).

:::

## Reference

- [Microsoft identity platform documentation](https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app)
