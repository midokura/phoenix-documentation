# Google SSO Setup Guide

This guide shows how to generate Google SSO credentials.

**Example hostname**: `https://console.phoenix-gpu.com`

## Outputs of This Guide

- **GOOGLE_CLIENT_ID**: Identifies your application
- **GOOGLE_CLIENT_SECRET**: Secret key for authentication
- **GOOGLE_REDIRECT_URI**: Callback URL after login
  - Example: `https://console.phoenix-gpu.com/api/auth/callback`

## Prerequisites

- Google account with access to [Google Cloud Console](https://console.cloud.google.com/)

## Setup Steps

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project dropdown at the top
3. Click **"New Project"**
4. Enter a project name (e.g., "IaaS Console")
5. Click **"Create"**

### 2. Create OAuth 2.0 Credentials

1. In the left sidebar, go to **APIs & Services** > **Credentials**
2. Click **"+ Create Credentials"** > **"OAuth client ID"**
3. If prompted, configure the OAuth consent screen first:
   - Choose **External** (or **Internal** for Google Workspace only)
   - Fill in app name and contact emails
   - Save and continue through the screens
4. Choose application type: **Web application**
5. Enter a name (e.g., "IaaS Console")
6. Under **Authorized JavaScript origins**:
   - Click **"+ Add URI"**
   - Add: `https://console.phoenix-gpu.com`
7. Under **Authorized redirect URIs**:
   - Click **"+ Add URI"**
   - Add: `https://console.phoenix-gpu.com/api/auth/callback`
8. Click **"Create"**

### 3. Copy Your Credentials

A dialog will show your credentials:

- **Client ID**: `GOOGLE_CLIENT_ID`
- **Client Secret**: `GOOGLE_CLIENT_SECRET`

**Important**: Copy and store these securely. The redirect URI you configured is your `GOOGLE_REDIRECT_URI`.

## Reference

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
