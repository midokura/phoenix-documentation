# Observability for Users
A Grafana Dashboard is provided that monitors all resources in the current Tenant. This Dashboard can be accessed by
clicking the **Observability 🔗** tab in the left sidebar. The Dashboard provides insights into the health and 
performance of your resources, including metrics such as CPU usage, memory usage, disk, and more and can help diagnose
issues and optimize resource utilization.

## Customizations
Users can specify a time range for the data displayed in the Dashboard, allowing them to focus on specific periods of 
interest. They can also choose the update frequency of the dashboard, but note that if this frequency is greater than the
frequency at which data is collected, the dashboard will not update with new data until the next collection cycle.

## Limitations
Due to how Grafana works and to ensure that users only see data for their own resources, the Dashboard cannot be edited
and filters can only be applied by clicking on the relevant resource in each panel in the Dashboard. This means that you
cannot apply filters to the entire Dashboard at once, but only to individual panels.

If you require extra observability, contact [support@midokura.com](mailto:support@midokura.com)
