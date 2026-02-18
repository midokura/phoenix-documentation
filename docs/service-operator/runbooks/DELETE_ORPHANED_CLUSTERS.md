# Deleting orphaned tenant clusters

## Purpose
This runbook deletes Magnum clusters that are orphaned (their parent OpenStack project no longer exists). These clusters cannot self-cleanup and must be manually removed.

This deletion process should be used when you have identified orphaned clusters in the database that are consuming resources but that have no valid project owner.

This process should take approximately 10 to 15 minutes per cluster.

---

## Prerequisites Checklist

Before starting, ensure you have:
- [ ] SSH access to the OpenStack control node
- [ ] MariaDB (OpenStack Database) root password
- [ ] OpenStack admin credentials sourced from `admin-openrc.sh`
- [ ] OpenStack CLI installed with `python-heatclient` plugin (try `openstack stack delete --help`)
- [ ] Access to Grafana for validation

---

## Step 1: Setup - Open Two Terminals

You will need two terminals open side-by-side:
- Terminal 1: For database (MariaDB) queries
- Terminal 2: For OpenStack commands

### [Terminal 1: Database] Setup MariaDB Connection

SSH to OpenStack control node and connect to MariaDB:
```bash
ssh ubuntu@control0
sudo podman exec -it mariadb mysql -h localhost -u root -p<password> magnum
```

**Expected result:** You should see the MySQL prompt: `MariaDB [magnum]>`

:::tip

Keep this terminal open, as you'll use it for all database queries.

:::

### [Terminal 2: OpenStack] Setup Admin Credentials

In the second terminal window, SSH to control node and source admin credentials:
```bash
ssh ubuntu@control0
source /path/to/admin-openrc.sh
```

**Expected result:** No output, but you can verify with: `openstack token issue`

:::tip

Keep this terminal open, as you'll use it for all OpenStack stack commands.

:::

---

## Step 2: Identify Orphaned Clusters

### [Terminal 1: Database] 2.1 Find Clusters with Nonexistent Projects
Run this query to list all deleted projects with orphaned clusters:

```sql
SELECT project_id FROM magnum.cluster c
WHERE NOT EXISTS (
    SELECT 1 FROM keystone.project p WHERE p.id = c.project_id
);
```

**Expected output:** A list of project IDs. Example:
```
+----------------------------------+
| project_id                       |
+----------------------------------+
| abc123-def456-ghi789-jkl012      |
| xyz789-uvw456-rst123-opq987      |
+----------------------------------+
```

**If no results:** No orphaned clusters exist. You're done! ✓

:::important:

Note down each `project_id` - you'll delete them one by one.

:::

---

## Step 3: Delete Each Orphaned Cluster

Repeat steps 3.1-3.5 for EACH project_id from Step 2

### [Terminal 1: Database] 3.1 Get Cluster Details

Replace `<project-id>` with the actual project ID from Step 2:

```sql
SELECT id, name, project_id, status, stack_id
FROM cluster
WHERE project_id='<project-id>';
```

**Expected output:** Cluster details including the `stack_id`. Example:
```
+-----+------------+----------------------------------+--------------------+----------------------------------+
| id  | name       | project_id                       | status             | stack_id                         |
+-----+------------+----------------------------------+--------------------+----------------------------------+
| 42  | k8s-prod-1 | abc123-def456-ghi789-jkl012      | CREATE_IN_PROGRESS | stack-uuid-here                  |
+-----+------------+----------------------------------+--------------------+----------------------------------+
```

:::important:

Copy the `stack_id` value for the next step.

:::

---

### [Terminal 2: OpenStack] 3.2 Delete the Stack (This Removes All Resources!)

:::warning

This will delete all resources associated with the stack, including instances, volumes, and networks.

:::

Replace `<stack_id>` with the value from step 3.1:

```bash
openstack stack delete <stack_id> --yes --wait
```

**Expected output:** Progress updates, then "Stack not found" when complete (30-60 seconds).

**If error "Stack not found" immediately:** Stack already deleted. Continue to next step.

---

### [Terminal 1: Database] 3.3 Delete Nodegroup Records

Replace `<project-id>` with the actual project ID:

```sql
DELETE FROM nodegroup WHERE project_id='<project-id>';
```

**Expected output:** `Query OK, X rows affected` (where X is the number of nodegroups, usually 2 per cluster).

---

### [Terminal 1: Database] 3.4 Delete Cluster Records

Replace `<project-id>` with the actual project ID:

```sql
DELETE FROM cluster WHERE project_id='<project-id>';
```

**Expected output:** `Query OK, 1 row affected` (or however many clusters for that project).

---

### [Terminal 1: Database] 3.5 Verify Deletion

```sql
SELECT COUNT(*) FROM cluster WHERE project_id='<project-id>';
```

**Expected output:** `0` (no clusters remain for this project).

---

---

### ✓ Checkpoint
One orphaned cluster deleted.

If you have more project IDs from Step 2, then go back to Step 3.1 and repeat using the next project_id.

When all clusters are deleted, continue to Step 4.

---

## Step 4: Final Validation

### [Terminal 1: Database] 4.1 Verify No More Orphaned Clusters

```sql
SELECT COUNT(*) AS orphaned_count FROM magnum.cluster c
WHERE NOT EXISTS (
    SELECT 1 FROM keystone.project p WHERE p.id = c.project_id
);
```

**Expected output:**
```
+----------------+
| orphaned_count |
+----------------+
|              0 |
+----------------+
```

### [Terminal 1: Database] 4.2 Exit MariaDB
```sql
exit;
```

### 4.3 Check Grafana Dashboard
1. Open your Grafana dashboard
2. Check the **Orphaned cluster** metric
3. Verify the count decreased to zero

**Expected result:** Cluster count reflects the deletions.

---

## ✓ Done

You have successfully deleted orphaned clusters. The resources (VMs, volumes, networks) have been cleaned up.

---

## Troubleshooting

### Problem: "Access denied for user 'root'" in Terminal 1
**Solution:** Double-check the MariaDB password. Get it from the deployment secrets.

### Problem: "Stack not found" in Step 3.2
**Solution:** This is OK - the stack was already deleted. Continue to step 3.3 to clean up DB records.

### Problem: DELETE query affects 0 rows
**Solution:** Records already deleted, or wrong project_id. Verify with a SELECT first.

### Problem: Stack delete hangs or times out
**Solution:** Check Heat logs for errors.
