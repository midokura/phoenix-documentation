# Router Host Log Access

Getting logs from the router

## Purpose

A known bug in the fluent-bit OpenWRT package ([openwrt/packages#28892](https://github.com/openwrt/packages/issues/28892)) prevents logs from being forwarded to Loki. Until the package is updated, router logs are not available in Grafana and must be read directly on the router host.

---

## Prerequisites Checklist

- [ ] SSH private key available
- [ ] Network access to `host-router`

---

## Step 1: Connect to the router host

```bash
ssh -i <ssh private key> root@host-router
```

---

## Step 2: Read the logs

OpenWRT uses `logread` to read from the in-memory syslog ring buffer.

**Dump all current logs:**

```bash
logread
```

**Follow logs in real time:**

```bash
logread -f
```

**Filter by keyword (e.g. a service name or error string):**

```bash
logread | grep dnsmasq
```

---

## Troubleshooting

### SSH connection refused or permission denied

Confirm you are using the correct key and that your machine has network access to `host-router`. If the connection still fails, check that the router host is reachable and the `root` user is authorized.

### `logread` output is empty

The syslog ring buffer is in-memory and resets on reboot. If the router was recently restarted, earlier log entries will not be available.
