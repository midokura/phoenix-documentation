# IPMI and SNMP Observability Setup

Configuring hardware and network monitoring for bare-metal servers and switches.

This guide explains what IPMI and SNMP monitoring collect, what credentials are required, and how to configure the inventory variables.

## What Is Being Monitored

### IPMI (Bare-Metal Server Hardware)

The IPMI exporter polls the Baseboard Management Controller (BMC) on each physical server over the network using the IPMI protocol. It collects:

- **Chassis power state** — whether the server is powered on or off
- **Fan speed** — RPM and health state per fan
- **Temperature** — readings and health state per temperature sensor (CPU, ambient, DIMM, etc.)
- **Voltage** — readings and health state per voltage rail
- **Power consumption** — real-time power draw in watts (requires DCMI support)
- **BMC info** — manufacturer, model, firmware version


### SNMP (Network Devices)

The SNMP exporter polls switches and other network devices via SNMPv3. It collects:

- **Interface traffic** — bytes in/out per interface
- **Interface state** — link up/down, errors, drops
- **System info** — hostname, description, uptime
- **IP routing stats** — (optional, via `ip_mib`)
- **Vendor-specific hardware** — (optional, e.g., `dell` module for Dell switches)

---

## IPMI Setup

### What You Need Per Server

For each bare-metal server you want to monitor, you need:

| Item | Description |
|------|-------------|
| **BMC hostname or IP** | The out-of-band management address (e.g., `control0-ipmi.bcn`) |
| **IPMI username** | A dedicated monitoring account on the BMC |
| **IPMI password** | Password for that account |

The minimum required privilege level is **USER** (read-only). Operator-level or Administrator-level access is not needed for metrics collection.

### Credentials

The IPMI exporter uses the same credentials for all targets that reference a given module. You can define dedicated IPMI variables or reuse the SNMP ones — they are independent.

You must create an account on each BMC with:
- **Username:** a dedicated monitoring username (e.g., `metrics`)
- **Password:** a strong password
- **Privilege:** USER (read-only; sufficient for all metrics)

### Inventory Configuration

```yaml
# Option A: dedicated IPMI credential variables (recommended)
ipmi_username: metrics
ipmi_password: !vault |
  $ANSIBLE_VAULT;1.1;AES256
  ... encrypted password ...

# Option B: reuse the SNMP "long" variables (matches the inventory.example.yml convention)
# snmp_v3_username_long: metrics
# snmp_v3_password_long: !vault | ...

# IPMI targets: one entry per server BMC
ipmi_targets:
  - name: "control0-ipmi"        # Unique label used in Grafana
    host: "control0-ipmi.bcn"    # BMC hostname or IP address
    module: "default"            # References ipmi_exporter_modules[].name
    scrape_interval: "1m"        # How often to poll this target

# Module definition: maps to an ipmi_exporter configuration block
ipmi_exporter_modules:
  - name: default
    user: "{{ ipmi_username }}"
    password: "{{ ipmi_password | trim }}"
    privilege: "USER"
    driver: "LAN_2_0"
    collectors:
      - bmc
      - chassis
      - dcmi
      - ipmi
```

> **Note:** Credentials are shared across all targets that reference the same module. If servers require different credentials, define additional entries in `ipmi_exporter_modules` with different names and reference them via `ipmi_targets[*].module`.

### Driver: Always Use `LAN_2_0`

The `driver: "LAN_2_0"` setting selects IPMI 2.0 (RMCP+), which uses modern cipher suites for authentication and encryption at the protocol level. This is the correct choice for any server manufactured in the last 15+ years. IPMI 1.5 (`LAN`) is obsolete and should not be used.

The `privilege` field in `ipmi_exporter_modules` is the IPMI privilege level (`USER`, `OPERATOR`, `ADMIN`). For metrics collection, `USER` is sufficient.

### Available Collectors

| Collector | What It Collects |
|-----------|-----------------|
| `bmc` | BMC manufacturer, model, firmware version |
| `chassis` | Chassis power state (on/off) |
| `dcmi` | Power consumption in watts (requires DCMI support on BMC) |
| `ipmi` | All IPMI sensors: temperature, fans, voltage, intrusion |
| `sel` | System Event Log entries (not in default config; adds noise) |

The default set (`bmc`, `chassis`, `dcmi`, `ipmi`) covers all metrics shown in the IPMI Exporter dashboard. Add `sel` only if you need event log monitoring.

### Scrape Interval

`1m` is the recommended interval for IPMI targets. Hardware sensor values change slowly, and IPMI polling generates BMC load — polling more frequently than once per minute is unnecessary and can cause issues on some BMC implementations.

---

## SNMP Setup

### What You Need Per Device

For each switch or network device:

| Item | Description |
|------|-------------|
| **Device hostname or IP** | Must be reachable from the metrics scraper VM |
| **SNMPv3 username** | A monitoring account configured on the device |
| **SNMPv3 password** | Auth (and optionally priv) password |
| **Auth/priv protocols** | Match what the device supports (see auth options below) |

### Defining Auth Profiles (`snmp_auths`)

Auth profiles are defined in inventory under `snmp_auths` and referenced by name from `snmp_targets[*].auth`. Each profile specifies the SNMPv3 parameters for one category of device.

Fields per profile:

| Field | Required | Description |
|-------|----------|-------------|
| `name` | yes | Identifier referenced in `snmp_targets[*].auth` |
| `version` | no | SNMP version, defaults to `3` |
| `username` | yes | SNMPv3 username configured on the device |
| `security_level` | yes | `authNoPriv` (auth only) or `authPriv` (auth + encryption) |
| `auth_protocol` | yes | `MD5`, `SHA`, `SHA256`, `SHA512` |
| `password` | yes | Auth password |
| `priv_protocol` | if authPriv | Encryption protocol, e.g. `AES` |
| `priv_password` | if authPriv | Encryption password |

**Choosing protocols:**
- Prefer `SHA` or higher over `MD5` if the device supports it
- Use `authPriv` + `AES` if the management network is untrusted; `authNoPriv` is sufficient on isolated OOB networks

> The `auth` field is an SNMP v3 concept and is unrelated to the IPMI `privilege` or `driver` settings.

### Choosing `snmp_targets[*].modules`

Modules define which SNMP MIBs to query. Each module in a target is scraped on its own interval:

| Module | MIB | What It Collects |
|--------|-----|-----------------|
| `system` | SNMPv2-MIB | Hostname, description, uptime |
| `if_mib` | IF-MIB | Interface traffic, errors, state |
| `ip_mib` | IP-MIB | IP routing statistics |
| `dell` | Dell vendor MIB | Dell-specific hardware status |

Start with `system` and `if_mib` — these cover the SNMP dashboard. Add `ip_mib` if you need routing stats. Add `dell` only for Dell network hardware.

### Scrape Interval per Module

Set the interval based on how fast the data changes and how much resolution you need:

| Module | Recommended Interval | Reason |
|--------|---------------------|--------|
| `system` | `5m` | Uptime and hostname change rarely |
| `if_mib` | `30s` | Interface traffic is time-sensitive |
| `ip_mib` | `30s` | Routing stats benefit from higher resolution |
| `dell` | `5m` | Hardware status changes slowly |

### Inventory Configuration

```yaml
snmp_monitoring_password: !vault |
  $ANSIBLE_VAULT;1.1;AES256
  ... encrypted password ...

# Define the auth profiles your devices need
snmp_auths:
  - name: switch_auth                          # Name referenced in snmp_targets[*].auth
    version: 3
    username: "metrics"
    security_level: authNoPriv
    auth_protocol: SHA
    password: "{{ snmp_monitoring_password }}"

snmp_targets:
  - name: "spine-switch"                       # Unique label used in Grafana
    host: "spine-switch.bcn"                   # Hostname or IP reachable from metrics scraper
    auth: "switch_auth"                        # References snmp_auths[*].name
    modules:
      - name: "system"
        scrape_interval: "5m"
      - name: "if_mib"
        scrape_interval: "30s"
```

---

## Encrypting Credentials

All passwords in the inventory must be encrypted with Ansible Vault before committing:

```bash
ansible-vault encrypt_string 'your-password-here' \
  --name 'snmp_v3_password_long' \
  --ask-vault-password
```

Copy the output block (starting with `!vault |`) into `inventory.yml`. See [DEPLOYMENT.md](DEPLOYMENT.md) for vault setup instructions.
