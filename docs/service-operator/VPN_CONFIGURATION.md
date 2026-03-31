# VPN Configuration as a Service Operator

Setting up the VPN as a Service Operator.

This guide explains how a service operator should set up VPN access for users who have been assigned to a tenant.

For help with setting up and configuring WireGuard, refer to the [WireGuard Quick Start guide](https://www.wireguard.com/quickstart/).

## Overview

When a user is added to a tenant, the operator can generate a VPN configuration script for that user. The user then combines this script with their private key to create a complete VPN configuration. This page explains the service operator steps, the user steps of this process are outlined [here](/docs/user/VPN_CONFIGURATION.md).

## Setup Process

Once the user has generated a WireGuard key pair and has shared the public key with the service operator, the VPN setup follows these steps:

1. Operator adds user to tenant with the public key
2. Operator fetches and provides VPN configuration script to the user

## Add User to Tenant

After receiving the user's public key, add the user to a tenant. The user's WireGuard public key must be provided in the `pubkey` field for VPN access configuration.

For complete API details and examples, see the [Add User to Tenant](OPERATOR_API_GUIDE.md#add-user-to-tenant) section in the Operator API Guide.

## Fetch and provide VPN Configuration Script

Retrieve the VPN configuration script for the user:

```bash
curl -H "Authorization: Bearer $JWT_TOKEN" \
     -H "Content-Type: application/json" \
     "${API_BASE_URL}/users/${USER_ID}/vpn" > vpn-config-script.sh
```

Provide this script to the user.

## Troubleshooting

If users report VPN connectivity issues, use the following steps to help diagnose the problem.

### Sample VPN Configuration

To retrieve the VPN configuration for a user, see [Fetch and provide VPN Configuration Script](#fetch-and-provide-vpn-configuration-script).

Here is a commented example of a WireGuard configuration file:

```ini
# Settings of the client side of the connection
[Interface]
# Your private (=personal and secret) key
PrivateKey = xXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx=
# Your address on the VPN
Address = 172.31.42.42/32
# DNS settings: DNS server address and (optional) Top Level Domain (TLD) used for hostnames
DNS = 172.31.0.254, tld
# (Optional) Maximum Transmissible Unit (MTU) of your Internet connection
MTU = 1312

# Settings of the server side of the connection
[Peer]
# The public (=to be used by all VPN clients, shared to all VPN clients) key of the server
PublicKey = ExampleServerPublicKey+/+/+/+/+/+/+/+/+/+/+=
# IP address ranges that should be accessed through the VPN
AllowedIPs = 10.8.42.0/24, 172.31.42.0/24
# Address and port of the VPN server that should be connected to
Endpoint = vpn.example.com:4242
# (Optional) How often (in seconds) to send a small packet to keep the connection active
PersistentKeepAlive = 25
```

### Verifying Connectivity

A key feature of WireGuard is that invalid packets are ignored.
This means that neither side of the connection will warn the other about invalid keys.
The absence of an error does not mean that the connection is successful: it is necessary to troubleshoot issues step-by-step.

#### Step 1: Verify that the server is reachable

Ping the WireGuard endpoint to confirm network connectivity:

```bash
# First, check that you can connect to the Internet.
ping midokura.com
# Then, try pinging the VPN server.
ping vpn.example.com
```

:::note
The VPN server may not be responding to ping by design.

#### Step 2: Verify VPN Connection

After enabling the WireGuard connection:

##### Check wg stats

Check the status of the Wireguard client locally:

`$ sudo wg`

Sample output when successfully connected:

```bash
interface: wg-tenant
  public key: ExampleUserPublicKey+/+/+/+/+/+/+/+/+/+/+/+=
  private key: (hidden)
  listening port: 49913

peer: ExampleServerPublicKey+/+/+/+/+/+/+/+/+/+/+=
  endpoint: 203.0.113.42:4242
  allowed ips: 10.8.42.0/24, 172.31.42.0/24
  latest handshake: 1 minute, 30 seconds ago
  transfer: 24.92 KiB received, 24.55 KiB sent
  persistent keepalive: every 25 seconds
```

Sample output when either the client key or the server key is incorrect:

```bash
interface: wg-tenant
  public key: ThisIsAnExampleOfIncorrectClientPublicKey+/=
  private key: (hidden)
  listening port: 45986

peer: ExampleServerPublicKey+/+/+/+/+/+/+/+/+/+/+=
  endpoint: 203.0.113.42:4242
  allowed ips: 10.8.42.0/24, 172.31.42.0/24
  transfer: 0 B received, 444 B sent
  persistent keepalive: every 25 seconds
```

:::note
In this case:
- some data is sent (but there is no indication of whether that data is correctly received by the server)
- zero bytes are received: either the server can not be validated and its data gets ignored, or the server can not validate the client, and does not reply.
- there is no "latest handshake" timestamp.

:::

##### Ping the DNS endpoint

Verify that traffic can go through the VPN to the server by pinging the DNS endpoint's IP address:

```bash
ping 172.31.0.254
```

A successful ping indicates the WireGuard connection is working correctly.

### Testing DNS

DNS resolution is critical for accessing resources through the VPN. You can troubleshoot like this, step-by-step:

```bash
# Test resolution of a public domain through the VPN server that is listed in the configuration
nslookup midokura.com 172.31.0.254

# Check that you can resolve the "tld" subdomain from the configuration if present in your Wireguard DNS config
nslookup myvm.tenant.example.tld 172.31.0.254

# Check that ".tld" DNS queries are sent to the VPN by default
nslookup myvm.tenant.example.tld

# Check that you can resolve the IA Factory Console URL
nslookup console.aifactory.example.tld 172.31.0.254

# Check that the DNS resolver is set correctly when connected
nslookup console.aifactory.example.com
```

Both commands should return valid IP addresses.
If DNS resolution fails, verify that the DNS servers specified in the WireGuard configuration are correct and reachable.

### Advanced VPN troubleshooting

Some troubleshooting steps are very specific (to your OS, browser, or Internet connection), and / or
not usually required.


#### Checking Allowed Routes

Resources accessed through the VPN must be covered by the `AllowedIPs` ranges in the WireGuard configuration.
For example, if a user needs to access a service on `10.0.0.5`, `AllowedIPs` must include `10.0.0.0/8` or a more specific range containing that IP.

Review the `AllowedIPs` configuration to ensure all required networks are included.

```ini
AllowedIPs = 10.8.42.0/24, 172.31.0.0/24
```

Typically, this will contain at least two networks:

- the address range of the tenant VPN. In the example config, the client address is `172.31.42.42/32`, the range is `172.31.42.0/24`.
- the address range of the tenant network resources. In the example config, this network is `10.8.42.0/24`.

When having connectivity issues to a resource, consider the address of the resource:
- Is it available on the VPN networks?
- Is the network covered by the VPN configuration?
- Is there a conflict between a local (non-VPN) network resource and a VPN address range?


#### MTU troubleshooting

MTU (Maximum Transmission Unit) issues can cause packets to be silently dropped.
IPv4 over IPv6 connections, for example, may have an MTU lower than the standard 1500 bytes.
This configuration is not always necessary, depending on whether the local network gateway is aware of the MTU.

Test your connection's MTU:

```bash
ping -4 -M do -s 1472 example.com
```

:::note
The IPv4 header adds 20 bytes, and the ICMP header adds 8 bytes to the packet size.
Therefore, we need to use a payload size of 1472 to test sending exactly 1500 byte packets.

:::

If this fails, try smaller packet sizes, for example, 1400 or 1300, to find the maximum working size. Ensure the MTU value in the VPN configuration is set appropriately for your network.

Sample output:

```bash
ping -4 -M do -s 1352 midokura.com
PING midokura.com (198.51.100.42) 1472(1500) bytes of data.
From _gateway (192.168.1.1) icmp_seq=1 Frag needed and DF set (mtu = 1380)
ping: sendmsg: Message too long
^C
ping -M do -s 1352 midokura.com
PING midokura.com (198.51.100.42) 1352(1380) bytes of data.
1360 bytes from 42-100.midokura.com (198.51.100.42): icmp_seq=1 ttl=47 time=12 ms
^C
```

:::note
In this example, the router is aware of the MTU and can deal with the packet size for us.
It replies with a message telling us "the MTU is 1380, I can't send your packet without fragmenting it".
When this happens, the MTU setting in the client configuration is not necessary.
Ping probes that fail with size 1472 and that work with size 1352, though, would indicate that 1380 <= MTU < 1500.

:::

##### For MacOS MTU testing: macOS `ping` flag differences

The macOS `ping` utility differs from its Linux counterpart.

To test MTU on macOS, use:

```sh
ping -D -s 1472 midokura.com
```

- Use `-D` instead of `-M do` to set the "do not fragment" flag.
- `ping` on macOS is IPv4-only, the `-4` flag is not needed.

#### macOS: WireGuard App Store Client specific information

The [WireGuard app from the Mac App Store](https://apps.apple.com/us/app/wireguard/id1451685025?mt=12) has several differences from the standard WireGuard tools used on Linux.

##### search domain not supported

The `DNS` field in the WireGuard configuration supports a search domain suffix (e.g. `DNS = 172.31.0.254, tld`) that allows short hostnames to be resolved through the VPN. This feature is **not supported** by the App Store client.

In this case, this needs to be set up via the system resolver, such as `/etc/resolver` instead:

```ini
# /etc/resolver/ai-factory.tld
domain tld
search tld
nameserver 172.31.0.254
```

Save the file and force a DNS refresh as follows:

```sh
sudo killall -HUP mDNSResponder
```

You can check that the settings are applied by the following command. You should see the entries added in `/etc/resolver`.

```sh
scutil --dns
```

##### Checking connection status

The App Store client does not bundle the `wg` command-line tool, so `sudo wg` is not available. To check the status of a tunnel, open **System Settings → VPN**, which shows connection state and transfer statistics for each configured tunnel.

#### Ubuntu and NetworkManager

Ubuntu uses NetworkManager to manage network connections, including WireGuard VPN.
NetworkManager provides a helper on top of `wg`, so the troubleshooting steps in this guide still apply.
However, if you experience connection issues after configuration changes, restarting the VPN connection or flushing the DNS cache can help.

**Restart the VPN connection:**

```bash
sudo nmcli connection down <vpn-connection-name>
sudo nmcli connection up <vpn-connection-name>
```

**Flush the DNS cache:**

```bash
sudo resolvectl flush-caches
```

### Browser DNS-over-HTTPS (DoH)

"DNS over HTTPS" (DoH) features may bypass the VPN's DNS configuration, causing resolution failures for resources only accessible through the VPN.

#### Firefox

To allow using the system DNS resolver in Firefox:

1. Open [about:preferences#privacy](Firefox's privacy preferences page)
2. Scroll to **DNS over HTTPS**
3. Select **Default Protection** or **Increased Protection** to allow using the system DNS, or **Off** to disable DoH altogether.


#### Chrome

To disable DoH in Chrome:

1. Open [chrome://settings/security](Chrome's settings page)
2. Scroll to **Use secure DNS**
3. Turn off the toggle, or select **With your current service provider**
