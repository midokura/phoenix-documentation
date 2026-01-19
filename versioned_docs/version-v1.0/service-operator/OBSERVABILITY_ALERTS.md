# Observability Alerts

Guide for accessing and configuring Grafana alert notifications.

This document explains how to access and configure Grafana alerts, and describes all available alert rules.

## Accessing Alerts

Alerts are accessible through the Grafana Alerting section:

1. **Navigate to Alerting:**
   - Click "Alerting" in the left sidebar
   - Select "Alert rules" to view all configured alerts

2. **View Alert Status:**
   - Alerts are organized by folder (e.g., "IaaS API SLOs", "Kubernetes Infrastructure SLOs")
   - Each alert shows its current state: Normal, Pending, Alerting, or No Data
   - Click on an alert to view details, history, and evaluation information

3. **Alert Groups:**
   - Alerts are grouped by category in folders
   - Each folder contains related SLO (Service Level Objective) alerts

## Alert Notification Configuration

**Important:** By default, alerts will not notify anyone when they fire. To receive notifications, you must configure contact points and notification policies.

### Step 1: Create Contact Points

Contact points define where alert notifications should be sent (email, Slack, PagerDuty, etc.).

1. **Navigate to Contact Points:**
   - In the left sidebar, go to "Alerting" → "Contact points"
   - Click "+ Create contact point"

2. **Configure Contact Point:**
   - **Name:** Enter a descriptive name (e.g., "Team Email", "On-Call Slack")
   - **Integration:** Select the notification channel type:
     - Email
     - Slack
     - PagerDuty
     - Webhook
     - And many others
   - **Configuration:** Fill in the specific settings for your chosen integration
   - Click "Save contact point"

3. **Default Email Contact Point:**
   - There is a pre-configured contact point called `grafana-default-email`
   - This is not configured by default
   - You can edit and configure it properly if you want to use email notifications

### Step 2: Configure Notification Policies

Notification policies determine which alerts send notifications to which contact points.

1. **Navigate to Notification Policies:**
   - In the left sidebar, go to "Alerting" → "Notification policies"

2. **Default Policy Configuration:**
   - The default policy uses `grafana-default-email`, but it is not configured, so it will throw errors by default
   - To route all notifications to your contact point:
     - Click "more ▼" on the default policy
     - Click "Edit"
     - Select your contact point from the "Contact point" dropdown
     - Click "Update default policy"

3. **Create Specific Alert Policies:**
   - To route specific alerts to different contact points:
     - Click "New child policy" under the default policy
     - **Matching labels:** Add label matchers to select which alerts this policy applies to:
       - Example: `severity=critical` to match all critical alerts
       - Example: `slo=latency` to match latency SLO alerts
       - You can add multiple labels for more specific matching
     - **Contact point:** Select the desired contact point for these alerts
     - **Optional settings:** Configure repeat interval, group by, etc.
     - Click "Save policy"

**Example Policy Setup:**
- Default policy: Routes all alerts to "Team Email" contact point
- Child policy 1: Routes `severity=critical` alerts to "On-Call PagerDuty" contact point
- Child policy 2: Routes `slo=latency` alerts to "Performance Team Slack" contact point

## Available Alerts

The Phoenix observability stack includes alerts organized into the following categories:

### IaaS API SLOs

**Folder:** "IaaS API SLOs"

#### 1. IaaS API Latency SLO Violation

**Description:** Monitors p95 latency of the IaaS API. Alerts when p95 latency exceeds the configured threshold.

**Labels:**
- `severity: warning`
- `slo: latency`

**Threshold:** Configurable via `__IAAS_API_P95_LATENCY__` (default: 1000ms)

---

#### 2. IaaS API Error Rate SLO Violation

**Description:** Monitors the percentage of 5xx HTTP errors. Alerts when error rate exceeds the configured threshold.

**Labels:**
- `severity: critical`
- `slo: error_rate`

**Threshold:** Configurable via `__IAAS_API_ERROR_RATE_THRESHOLD__` (default: 0.1%)

---

### IPMI Hardware Health SLOs

**Folder:** "IPMI Hardware Health SLOs"

#### 3. IPMI Temperature Health SLO Violation

**Description:** Monitors the percentage of temperature sensors in normal state. Alerts when the percentage drops below the threshold.

**Labels:**
- `severity: warning`
- `slo: temperature_health`

**Threshold:** Configurable via `__IPMI_TEMP_THRESHOLD__` (default: 99.9%)

---

#### 4. IPMI Fan Health SLO Violation

**Description:** Monitors the percentage of fans in normal state. Alerts when the percentage drops below the threshold.

**Labels:**
- `severity: critical`
- `slo: fan_health`

**Threshold:** Configurable via `__IPMI_FAN_THRESHOLD__` (default: 100%)

---

#### 5. IPMI Power Supply Health SLO Violation

**Description:** Monitors the percentage of power supplies in normal state. Alerts when the percentage drops below the threshold.

**Labels:**
- `severity: critical`
- `slo: power_supply_health`

**Threshold:** Configurable via `__IPMI_POWER_THRESHOLD__` (default: 100%)

---

#### 6. IPMI Voltage Health SLO Violation

**Description:** Monitors the percentage of voltage sensors in normal state. Alerts when the percentage drops below the threshold.

**Labels:**
- `severity: warning`
- `slo: voltage_health`

**Threshold:** Configurable via `__IPMI_VOLTAGE_THRESHOLD__` (default: 99.9%)

---

### Kubernetes Infrastructure SLOs

**Folder:** "Kubernetes Infrastructure SLOs"

#### 7. Pod Health SLO Violation

**Description:** Monitors the percentage of failed pods in the cluster. Alerts when the failure rate exceeds the threshold.

**Labels:**
- `severity: warning`
- `slo: pod_health`

**Threshold:** Configurable via `__K8S_POD_HEALTH_THRESHOLD__` (default: 1%)

---

#### 8. Failed Pods

**Description:** Monitors the absolute count of failed pods. Alerts when the count exceeds the threshold.

**Labels:**
- `severity: warning`
- `slo: pod_health`

**Threshold:** Configurable via `__K8S_FAILED_PODS_COUNT__` (default: 1)

---

#### 9. Node CPU Utilization SLO Violation

**Description:** Monitors average CPU utilization across all nodes. Alerts when utilization exceeds the threshold.

**Labels:**
- `severity: warning`
- `slo: cpu_utilization`

**Threshold:** Configurable via `__K8S_CPU_THRESHOLD__` (default: 80%)

---

#### 10. Node Memory Utilization SLO Violation

**Description:** Monitors average memory utilization across all nodes. Alerts when utilization exceeds the threshold.

**Labels:**
- `severity: warning`
- `slo: memory_utilization`

**Threshold:** Configurable via `__K8S_MEMORY_THRESHOLD__` (default: 85%)

---

#### 11. Node Disk Utilization SLO Violation

**Description:** Monitors maximum disk utilization across all nodes. Alerts when utilization exceeds the threshold.

**Labels:**
- `severity: warning`
- `slo: disk_utilization`

**Threshold:** Configurable via `__K8S_DISK_THRESHOLD__` (default: 90%)

---

### OpenStack Infrastructure SLOs

**Folder:** "OpenStack Infrastructure SLOs"

#### 12. Nova Service Availability SLO Violation

**Description:** Monitors the availability of Nova compute agents. Alerts when availability drops below the threshold.

**Labels:**
- `severity: critical`
- `slo: nova_availability`

**Threshold:** Configurable via `__OS_NOVA_THRESHOLD__` (default: 100%)

---

#### 13. Cinder Service Availability SLO Violation

**Description:** Monitors the availability of Cinder volume agents. Alerts when availability drops below the threshold.

**Labels:**
- `severity: critical`
- `slo: cinder_availability`

**Threshold:** Configurable via `__OS_CINDER_THRESHOLD__` (default: 100%)

---

#### 14. Neutron Service Availability SLO Violation

**Description:** Monitors the availability of Neutron network agents. Alerts when availability drops below the threshold.

**Labels:**
- `severity: warning`
- `slo: neutron_availability`

**Threshold:** Configurable via `__OS_NEUTRON_THRESHOLD__` (default: 99.9%)

---

#### 15. OpenStack Memory Capacity SLO Violation

**Description:** Monitors OpenStack memory quota usage. Alerts when usage exceeds the threshold percentage.

**Labels:**
- `severity: warning`
- `slo: openstack_memory_capacity`

**Threshold:** Configurable via `__OS_MEMORY_CAPACITY_THRESHOLD__` (default: 90%)

---

#### 16. OpenStack CPU Capacity SLO Violation

**Description:** Monitors OpenStack CPU quota usage. Alerts when usage exceeds the threshold percentage.

**Labels:**
- `severity: warning`
- `slo: openstack_cpu_capacity`

**Threshold:** Configurable via `__OS_CPU_CAPACITY_THRESHOLD__` (default: 85%)

---

#### 17. OpenStack Storage Capacity SLO Violation

**Description:** Monitors OpenStack storage pool capacity usage. Alerts when usage exceeds the threshold percentage.

**Labels:**
- `severity: warning`
- `slo: openstack_storage_capacity`

**Threshold:** Configurable via `__OS_STORAGE_CAPACITY_THRESHOLD__` (default: 90%)

---

### VM Management SLOs

**Folder:** "VM Management SLOs"

#### 18. VM Availability SLO Violation

**Description:** Monitors the percentage of VMs in running state. Alerts when availability drops below the threshold.

**Labels:**
- `severity: warning`
- `slo: vm_availability`

**Threshold:** Configurable via `__VM_AVAILABILITY_THRESHOLD__` (default: 99.9%)

---

## Alert Label Reference

Alerts use labels for filtering and routing. Common labels include:

### Severity Labels
- `severity: warning` - Warning-level alerts (non-critical issues)
- `severity: critical` - Critical alerts (requires immediate attention)

### SLO Labels
- `slo: latency` - API latency SLO violations
- `slo: error_rate` - API error rate SLO violations
- `slo: temperature_health` - Hardware temperature health
- `slo: fan_health` - Hardware fan health
- `slo: power_supply_health` - Hardware power supply health
- `slo: voltage_health` - Hardware voltage sensor health
- `slo: pod_health` - Kubernetes pod health
- `slo: cpu_utilization` - Node CPU utilization
- `slo: memory_utilization` - Node memory utilization
- `slo: disk_utilization` - Node disk utilization
- `slo: nova_availability` - Nova service availability
- `slo: cinder_availability` - Cinder service availability
- `slo: neutron_availability` - Neutron service availability
- `slo: openstack_memory_capacity` - OpenStack memory capacity
- `slo: openstack_cpu_capacity` - OpenStack CPU capacity
- `slo: openstack_storage_capacity` - OpenStack storage capacity
- `slo: vm_availability` - VM availability

## Example Notification Policy Setup

Here's an example of how to set up notification policies:

1. **Default Policy:**
   - Contact point: "Team Email"
   - Applies to: All alerts (no matchers)

2. **Critical Alerts Policy:**
   - Contact point: "On-Call PagerDuty"
   - Matching labels: `severity=critical`

3. **API Performance Policy:**
   - Contact point: "API Team Slack"
   - Matching labels: `slo=latency` OR `slo=error_rate`

4. **Hardware Health Policy:**
   - Contact point: "Hardware Team Email"
   - Matching labels: `slo=fan_health` OR `slo=power_supply_health` OR `slo=temperature_health`

This setup ensures:
- All alerts go to the team email by default
- Critical alerts also trigger PagerDuty for on-call engineers
- API-related alerts go to the API team's Slack channel
- Hardware issues go to the hardware team

## Alert Rule Management

**Important:** The provided alert rules cannot be removed or edited.

### Muting Alert Rules

If an alert rule doesn't satisfy your needs, you can mute it:

1. Navigate to "Alerting" → "Alert rules"
2. Find the alert rule you want to mute
3. Click on the alert rule to open its details
4. Click "Mute" and configure the mute duration
5. The alert will continue to evaluate but won't send notifications while muted

### Creating Custom Alert Rules

If you need different alert rules, you can create them manually through Grafana's GUI:

1. Navigate to "Alerting" → "Alert rules"
2. Click "+ New alert rule"
3. Configure your custom alert:
   - **Name:** Enter a descriptive name
   - **Folder:** Select or create a folder for organization
   - **Query:** Define the Prometheus query that evaluates the condition
   - **Condition:** Set the threshold and evaluation criteria
   - **Labels:** Add labels for routing and filtering
   - **Annotations:** Add summary and description templates
4. Click "Save rule"


