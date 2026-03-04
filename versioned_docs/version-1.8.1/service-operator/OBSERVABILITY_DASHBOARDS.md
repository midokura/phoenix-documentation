# Observability Dashboards

Accessing and understand the Grafana dashboards.

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

**Purpose:** Monitors the IaaS Console API performance and health metrics using OpenTelemetry instrumentation.

**Key Metrics:**
- **Requests per Second (RPS)** - Total request rate across all routes
- **Error Rate (%)** - Percentage of 5xx HTTP errors
- **Average Latency (ms)** - Mean response time
- **RPS by Route** - Request rate broken down by API endpoint
- **p95 Latency by Route** - 95th percentile latency per endpoint
- **Global Latency Percentiles** - p50, p90, p95, p99 latency distribution
- **Response Codes** - Distribution of HTTP status codes (share of traffic)
- **RPS by Method** - Request rate by HTTP method (GET, POST, PUT, DELETE, etc.)
- **Top Traffic Routes** - Table showing the 10 busiest endpoints
- **Top Slow Routes** - Table showing the 10 slowest endpoints (by p95 latency)
- **Latency Distribution** - Heatmap showing request latency distribution over time

**Variables:**
- `service` - Filter by service name (e.g., "iaas-api")
- `route` - Filter routes by regex pattern (default: `.*`)
- `method` - Filter HTTP methods by regex pattern (default: `.*`)

**Auto-refresh:** Every 5 seconds


---

### 2. Nodes

**Purpose:** Monitors physical node (bare-metal server) resource utilization and health using node_exporter metrics.

**Key Metrics:**
- **CPU Usage Percent** - Current CPU utilization (gauge)
- **CPU Usage Percent Over Time** - Historical CPU utilization time series
- **RAM Usage Percent** - Current memory utilization (gauge)
- **RAM Usage Percent Over Time** - Historical memory utilization time series
- **Network Receive Mbps** - Incoming network traffic rate (excluding loopback interfaces)
- **Network Transmit Mbps** - Outgoing network traffic rate (excluding loopback interfaces)
- **Disk Space Usage Percent per Mount** - Disk utilization per mount point (bar gauge, excludes tmpfs/overlay/squashfs/devtmpfs)

**Variables:**
- `instance` - Multi-select filter for specific nodes (default: All)

**Auto-refresh:** Every 30 seconds

**Default Time Range:** Last 6 hours


---

### 3. OpenStack Dashboard

**Purpose:** Comprehensive monitoring of OpenStack services, resources, and infrastructure using openstack-exporter metrics.

**Service Status Section:**
- **Nova Agents Down** - Count of offline Nova compute agents
- **Nova Agent Status** - Detailed table of Nova agent states
- **Nova Agents Up** - Count of online Nova compute agents
- **Cinder Agents Down** - Count of offline Cinder volume agents
- **Cinder Agent Status** - Detailed table of Cinder agent states
- **Cinder Agents Up** - Count of online Cinder volume agents
- **Neutron Agents Down** - Count of offline Neutron network agents
- **Neutron Agent Status** - Detailed table of Neutron agent states
- **Neutron Agents Up** - Count of online Neutron network agents

**Resource Usage Section:**
- **Overall Memory Usage (TiB)** - Allocated vs available memory across the cloud
- **Overall CPU Cores Usage** - Allocated vs available vCPUs
- **Local Storage** - Disk capacity statistics (used, available, total)
- **Neutron Stats** - Floating IPs (free/used), networks, routers, security groups, subnets
- **Keystone Stats** - Projects, users, and groups
- **Virtual Machines** - Running instances and total instance count
- **Cinder Volumes/Snapshots** - Volume and snapshot counts
- **Glance Images** - Image count in the image registry

**Variables:**
- `interval` - Query interval selector (options: 5s, 10s, 30s, 1m, 5m, 15m, 30m, 1h, 6h, 12h, 1d, 7d, 14d, 30d)

**Default Time Range:** Last 6 hours

---

### 4. VMs Overview

**Purpose:** Detailed monitoring of individual virtual machines running on OpenStack compute nodes using libvirt_exporter metrics.

**Key Metrics:**
- **VMs Filtered by Domain** - Count of VMs matching the domain filter
- **CPU Usage Percent** - Per-VM CPU utilization (gauge)
- **Memory Usage Percent** - Per-VM memory utilization (gauge)
- **CPU Usage Percent Over Time** - Historical CPU utilization time series per VM
- **Memory Usage Percent Over Time** - Historical memory utilization time series per VM
- **Network Throughput** - Combined receive + transmit bytes per second per VM
- **Per vCPU Time Seconds Rate** - CPU time consumption per virtual CPU
- **vCPU Wait Time Seconds Rate** - Time vCPUs spend waiting for resources
- **RSS Bytes** - Resident Set Size (actual physical memory used by VM)
- **Block Read and Write Bytes Rate** - Disk I/O throughput per VM
- **Block I/O Time Seconds Rate** - Time spent on disk operations
- **Disk Capacity Total** - Total disk space allocated per VM
- **Network Errors and Drops** - Receive errors and transmit drops per VM
- **VM Power State** - Current VM state (running, stopped, etc.)
- **Interesting Metrics Quick View** - Table with CPU time, RSS, and major page faults

**Variables:**
- `domain` - Multi-select filter for VM domains/names (supports regex, default: `.*`)

**Auto-refresh:** Every 30 seconds

**Default Time Range:** Last 6 hours

---

### 5. IPMI Exporter

**Purpose:** Hardware-level monitoring of bare-metal servers via IPMI (Intelligent Platform Management Interface).

**Key Metrics:**
- **Power Status** - Chassis power state (Powered On/Off)
- **Machine Info** - BMC information table (manufacturer, model, firmware version)
- **Fan Speed State** - Status of each fan (Normal/Warning/Critical)
- **Fan Speed in RPM** - Rotations per minute for each fan
- **Power Consumption (Watts)** - Real-time power draw over time
- **Power State** - Power supply status per component (Normal/Warning/Critical)
- **Power Reading (Watts)** - Current power consumption gauge
- **IPMI Sensors State** - Comprehensive table of all sensor states
- **Temperature State** - Temperature sensor status table (Normal/Warning/Critical)
- **Temperatures** - Temperature readings in Celsius (gauge)
- **Voltage State** - Voltage sensor status per component
- **Voltage Reading (Volts)** - Voltage readings per sensor

**Variables:**
- `instance` - Select IPMI exporter instance
- `device_host` - Filter by device hostname

**Default Time Range:** Last 6 hours

---

### 6. SNMP (IF-MIB)

**Purpose:** Network interface monitoring for switches and network devices via SNMP using the snmp_exporter.

**Key Metrics:**
- **Switch Name** - Device hostname and system information
- **Total Out/In** - Total bytes transmitted/received over the selected time range
- **Uptime** - Device uptime (displayed as time duration)
- **Max Out/In (Current)** - Maximum current interface rates
- **Selected Interface Traffic and Totals** - Detailed table for specific interface showing:
  - Current out/in rates (Bps)
  - Total out/in bytes
  - Interface bandwidth (Mbits)
- **Out/In (Selected Interface)** - Time series graph of traffic for selected interface
- **All Interfaces** - Comprehensive table of all interfaces with traffic statistics
- **Out/In (Current)** - Bar gauges showing current out/in rates for all active interfaces
- **Build Info** - SNMP exporter build information table

**Variables:**
- `Job` - SNMP exporter job name (default: "snmp_exporter")
- `DeviceHost` - Multi-select device hostname filter (default: All)
- `IP` - Select specific device IP address
- `Interface` - Filter by interface name using regex pattern (default: `.*`)

---

### 7. Management K8S

**Purpose:** Comprehensive Kubernetes cluster monitoring dashboard covering nodes, pods, namespaces, and container resources. Community dashboard from grafana.com (ID: 15661).

**Node Resource Overview:**
- **Node Memory Ratio** - Memory utilization per node
- **Node CPU Ratio** - CPU utilization per node
- **Nodes with Pod** - Pod distribution across nodes
- **Memory Usage** - Time series memory usage per node
- **CPU Used Cores** - CPU core consumption per node
- **Pod Number and Nodes** - Pod counts per node
- **Node CPU Breakdown** - CPU usage breakdown by state
- **Node Memory Breakdown** - Memory usage breakdown by type
- **Node Network Overview** - Network bandwidth per node
- **Node Information Detail** - Comprehensive node details table

**Namespace Resource Statistics:**
- **Namespace Network Overview** - Network traffic per namespace
- **Namespaces CPU Usage** - CPU usage for namespaces consuming >0.5 cores
- **Namespaces WSS Memory Usage** - Memory usage for namespaces using >1G

**Storage:**
- **PVC Storage Usage** - Persistent volume claim utilization

**Pod Resource Overview:**
- **Pod Resource Detail** - CPU, memory, network for selected pods
- **Pod Containers CPU Utilization** - Per-container CPU usage
- **Pod Container Memory Usage** - Per-container memory consumption
- **Pod Network Bandwidth** - Network throughput per pod
- **Pod Containers WSS/RSS Memory** - Working set size and resident set size

**Microservices (Container Name) Overview:**
- **Resource Statistics** - Aggregated stats per container/microservice
- **Average CPU/Memory Usage** - Mean resource utilization
- **Network Bandwidth** - Network throughput per microservice
- **Overall CPU Cores/Memory Used** - Total resource consumption
- **Pod Number** - Number of pods per microservice

**Variables:**
- `Cluster` - Cluster name filter
- `Node` - Multi-select node filter (supports All)
- `NameSpace` - Namespace filter (supports All)
- `Pod` - Pod filter (supports All)
- `Container` - Container/microservice filter (supports All)

**Auto-refresh:** Every 30 seconds

---

### 8. WireGuard VPN - Multi-Tenant Monitoring

**Purpose:** Multi-tenant VPN monitoring dashboard for WireGuard VPN infrastructure, including agent health, peer connections, network traffic, and user synchronization.

**Overview Section:**
- **Total Registered Peers** - Sum of all peers across all tenants
- **Connected Peers** - Currently active peer connections
- **Connection Rate** - Rate of new connections over time
- **Service Uptime** - VPN service availability
- **Synced Users** - Number of users synchronized with the VPN system
- **Agent Health (5m)** - Agent health status over the last 5 minutes

**Connection Status:**
- **Connection Status** - Current peer connection states
- **Peers Status Over Time** - Historical peer status time series
- **Connected Peers by Tenant** - Breakdown of connections per tenant

**Network Traffic:**
- **Network Traffic** - Combined receive/transmit traffic time series
- **Network Throughput (5m rate)** - Bandwidth utilization over 5-minute intervals
- **Total Data Transfer** - Cumulative data transferred

**Agent Health & Reconciliation:**
- **Reconciliation Rate (per minute)** - Frequency of configuration reconciliations
- **Reconciliation Duration** - Time taken to complete reconciliation cycles
- **User Changes (per minute)** - Rate of user additions/updates/deletions
- **Reconciliation Errors by Type** - Error breakdown per error category

**Agent Information:**
- **Agent Runtime Information** - Agent version, start time, and configuration details

**Logs:**
- **VPN Server Logs** - Real-time log viewer for WireGuard VPN server logs (powered by Loki)

**Variables:**
- `tenant_id` - Multi-select filter for tenant IDs (default: All)

**Auto-refresh:** Every 30 seconds

**Default Time Range:** Last 1 hour

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

