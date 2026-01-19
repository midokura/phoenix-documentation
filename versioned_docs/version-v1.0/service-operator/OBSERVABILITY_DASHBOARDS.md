# Observability Dashboards

Guide for accessing and using Grafana observability dashboards.

This document explains how to access the Grafana dashboards and what each dashboard displays.

## Accessing Grafana

### Via Ingress (Production)

Grafana is accessible through the configured ingress host. The exact URL depends on your environment configuration:

```bash
# Example URL
http://grafana.{{ cluster_name }}.{{ cluster_top_level_domain }}
```

**Default Credentials:**
- Username: `admin`
- Password: Password provided through inventory.yml

To retrieve the password from Kubernetes:
```bash
kubectl get secret -n observability grafana -o jsonpath="{.data.admin-password}" | base64 -d
```

## Available Dashboards

The Phoenix observability stack includes several pre-configured dashboards that are automatically loaded into Grafana.

### 1. IaaS API (FastAPI)

**Purpose:** Monitors the IaaS Console API performance and health metrics.

**Key Metrics:**
- **Requests per Second (RPS)** - Total request rate across all routes
- **Error Rate (%)** - Percentage of 5xx HTTP errors
- **Average Latency (ms)** - Mean response time
- **RPS by Route** - Request rate broken down by API endpoint
- **p95 Latency by Route** - 95th percentile latency per endpoint
- **Global Latency Percentiles** - p50, p90, p95, p99 latency distribution
- **Response Codes** - Distribution of HTTP status codes (2xx, 3xx, 4xx, 5xx)
- **RPS by Method** - Request rate by HTTP method (GET, POST, PUT, DELETE, etc.)
- **Top Traffic Routes** - Table showing the 10 busiest endpoints
- **Top Slow Routes** - Table showing the 10 slowest endpoints (by p95 latency)
- **Latency Distribution** - Heatmap showing request latency distribution over time

**Variables:**
- `service` - Filter by service name (e.g., "iaas-api")
- `route` - Filter routes by regex pattern (default: `.*`)
- `method` - Filter HTTP methods by regex pattern (default: `.*`)


---

### 2. Nodes

**Purpose:** Monitors physical node (bare-metal server) resource utilization and health.

**Key Metrics:**
- **CPU Usage Percent** - Current CPU utilization (gauge and time series)
- **RAM Usage Percent** - Current memory utilization (gauge and time series)
- **Network Receive Mbps** - Incoming network traffic rate
- **Network Transmit Mbps** - Outgoing network traffic rate
- **Disk Space Usage Percent** - Disk utilization per mount point (bar gauge)

**Variables:**
- `instance` - Multi-select filter for specific nodes (default: All)


---

### 3. OpenStack Dashboard

**Purpose:** Comprehensive monitoring of OpenStack services, resources, and infrastructure.

**Service Status Section:**
- **Nova Agents** - Count of up/down Nova compute agents and detailed status table
- **Cinder Agents** - Count of up/down Cinder volume agents and detailed status table
- **Neutron Agents** - Count of up/down Neutron network agents and detailed status table

**Resource Usage Section:**
- **Overall Memory Usage (TiB)** - Allocated vs reserved memory across the cloud
- **Overall CPU Cores Usage** - Allocated vs reserved vCPUs
- **Local Storage** - Total local storage allocated to VMs
- **Neutron Stats** - Floating IPs, networks, security groups, and subnets
- **Keystone Stats** - Projects, users, and groups
- **Virtual Machines** - Running and total VM counts
- **Cinder Volumes/Snapshots** - Volume and snapshot counts
- **Glance Images** - Image count in the image registry

**Variables:**
- `cluster` - Filter by OpenStack cluster name
- `interval` - Query interval selector (5s to 30d)

---

### 4. VMs Overview

**Purpose:** Detailed monitoring of individual virtual machines running on OpenStack compute nodes.

**Key Metrics:**
- **VM Count** - Number of VMs filtered by domain
- **CPU Usage Percent** - Per-VM CPU utilization (gauge and time series)
- **Memory Usage Percent** - Per-VM memory utilization (gauge and time series)
- **Network Throughput** - Combined receive + transmit bytes per second per VM
- **Per vCPU Time Seconds Rate** - CPU time consumption per virtual CPU
- **vCPU Wait Time** - Time vCPUs spend waiting for resources
- **RSS Bytes** - Resident Set Size (actual physical memory used)
- **Block Read/Write Bytes Rate** - Disk I/O throughput
- **Block I/O Time Seconds Rate** - Time spent on disk operations
- **Network Errors and Drops** - Receive errors and transmit drops
- **Disk Capacity Total** - Total disk space allocated per VM
- **VM Power State** - Current state (running, stopped, etc.)
- **Interesting Metrics Quick View** - Table with CPU time, RSS, and major faults

**Variables:**
- `domain` - Multi-select filter for VM domains/names (supports regex, default: All)

---

### 5. IPMI Exporter

**Purpose:** Hardware-level monitoring of bare-metal servers via IPMI (Intelligent Platform Management Interface).

**Key Metrics:**
- **Power Status** - Chassis power state (Powered On/Off)
- **Machine Info** - BMC information table (manufacturer, model, firmware version)
- **Fan Speed State** - Status of each fan (Normal/Warning/Critical)
- **Fan Speed (RPM)** - Rotations per minute for each fan
- **Power Consumption (Watts)** - Real-time power draw over time
- **Power State** - Power supply status per component
- **Power Reading (Watts)** - Current power consumption gauge
- **IPMI Sensors State** - Comprehensive table of all sensor states
- **Temperature State** - Temperature sensor status table
- **Temperatures** - Temperature readings in Celsius (gauge)
- **Voltage State** - Voltage sensor status
- **Voltage Reading (Volts)** - Voltage readings per sensor

**Variables:**
- `instance` - Select IPMI exporter instance
- `device_host` - Filter by device hostname

---

### 6. SNMP (IF-MIB)

**Purpose:** Network interface monitoring for switches and network devices via SNMP.

**Key Metrics:**
- **Switch Name** - Device hostname and system name
- **Uptime** - Device uptime in milliseconds
- **Total In/Out** - Total bytes received/transmitted over selected time range
- **Max In/Out (Current)** - Maximum current interface rates
- **Selected Interface Traffic** - Detailed table for a specific interface showing:
  - Current in/out rates (Bps)
  - Total in/out bytes
  - Interface bandwidth (Mbits)
- **All Interfaces** - Comprehensive table of all interfaces with traffic stats
- **Out/In Time Series** - Historical traffic graphs for selected interface
- **Out/In (Current)** - Bar gauges showing current rates for all active interfaces

**Variables:**
- `Job` - SNMP exporter job name (default: "snmp_exporter")
- `DeviceHost` - Filter by device hostname (multi-select, default: All)
- `IP` - Select specific device IP address
- `Interface` - Filter by interface name (regex pattern)

---

### 7. Kubernetes 

**Purpose:** Standard Kubernetes cluster monitoring dashboard covering pods, nodes, deployments, and cluster resources.

**Common Metrics:**
- Cluster overview (CPU, memory, pod counts)
- Node metrics (CPU, memory, disk, network per node)
- Pod metrics (CPU, memory, network per pod)
- Deployment and replica set status
- Namespace resource usage
- Container resource limits and requests
- Network policies and ingress/egress traffic

---

## Dashboard Navigation

### Finding Dashboards

1. **Via Search:**
   - Click the search icon (🔍) in the topbar
   - Type dashboard name
   - Select from results

2. **Via Dashboard List:**
   - Click "Dashboards" → "Browse" in the left sidebar
   - All Phoenix dashboards are in the default folder

### Dashboard Variables

Most dashboards include variables (dropdowns) at the top for filtering:
- **Service/Instance Selectors** - Filter metrics by specific services or nodes
- **Time Range Selectors** - Adjust the time window for data display
- **Regex Filters** - Use regex patterns to filter routes, interfaces, etc.

### Time Range Selection

Use the time picker in the top-right corner to:
- Select predefined ranges (Last 5 minutes, Last hour, etc.)
- Set custom time ranges
- Use relative time (e.g., "now-6h" to "now")

### Refreshing Dashboards

- **Auto-refresh:** Some dashboards auto-refresh
- **Manual refresh:** Click the refresh icon (🔄) in the top-right
- **Set refresh interval:** Click the time picker → "Refresh" dropdown

