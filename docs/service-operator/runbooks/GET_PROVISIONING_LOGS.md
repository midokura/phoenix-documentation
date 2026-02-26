# Getting provisioning logs

## Purpose

In order to troubleshoot issues with provisioning, it may be necessary to see what the underlying Ironic Provisioning Agent (IPA) is doing when it prepares or clean a baremetal (BM) instance.

This playbook explains how to get the logs for these actions.

## Prerequisites checklist

Before starting, ensure you have:
- [ ] SSH access to the OpenStack control node
- [ ] Ubuntu user sudo password

## Step 1 - Connect to the control node running Ironic Conductor

In a terminal window, SSH to the first control node and get a root shell:

```sh
ssh ubuntu@control0
```

## Step 2 - Identify logs

The logs are placed inside the Ironic Conductor container.

### Podman

```sh
sudo podman exec ironic_conductor ls /var/log/kolla/ironic/
```

Sample output
```
493017fa-2dca-4f40-8fd4-8acd3d618814_playbook-baremetal-node_6854e180-0586-4e53-97e4-17b0e5ea456b_2026-02-23-16-03-12.tar.gz
493017fa-2dca-4f40-8fd4-8acd3d618814_playbook-baremetal-node_cleaning_2026-02-23-15-42-13.tar.gz
apache-access.log
apache-error.log
b2160a16-79b7-4fcc-8a77-b34c7e601215_playbook-baremetal-node_cleaning_2026-02-25-10-25-35.tar.gz
ironic-api-access.log
ironic-api-error.log
ironic-api-wsgi.log
ironic-conductor.log
ironic-dbsync.log
ironic-http-access.log
ironic-http-error.log
ironic-prometheus-exporter-wsgi-access.log
ironic-prometheus-exporter-wsgi-error.log
```

### Docker

## Step 3 - Retrieve logs

The logs file names contain:

- the UUID of the baremetal node, as can be seen in the Operator Console UI
- the name of the baremetal node, as entered in the Console UI by the operator during the BM registration flow
- the operation that was requested from the IPA, e.g:
  - cleaning
  - inspect
  - or the UUID of the BM as visible in the User Console UI
- the date of the log creation, in YYYY-MM-dd-hh-mm-ss format

Identify the relevant logs. Let's say we want to troubleshoot cleaning of `playbook-baremetal-node` from `2026-02-25-10-25-35`.

We can retrieve the file as follows:

### Podman

```sh
sudo podman cp ironic_conductor:/var/log/kolla/ironic/b2160a16-79b7-4fcc-8a77-b34c7e601215_playbook-baremetal-node_cleaning_2026-02-25-10-25-35.tar.gz /home/ubuntu/
```

### Docker


## Step 4 - Extract and consult logs

We used `sudo` to run container commands just before, which created the files as the `root` user. To access them as `ubuntu`, let's first fix the file owner to `ubuntu`:

```sh
sudo chown ubuntu:ubuntu b2160a16-79b7-4fcc-8a77-b34c7e601215_playbook-baremetal-node_cleaning_2026-02-25-10-25-35.tar.gz
```

We can now extract the logs:

```sh
mkdir -pv my_log_folder
tar xvzf b2160a16-79b7-4fcc-8a77-b34c7e601215_playbook-baremetal-node_cleaning_2026-02-25-10-25-35.tar.gz -C my_log_folder
```
Sample output
```
journal
df
dmesg
efibootmgr
iptables
ip_addr
lsblk
lsblk-full
lshw
mdstat
mount
multipath
parted
ps
udev/sda
udev/sda1
udev/sda2
udev/sdb
udev/sdb1
udev/sdb2
udev/md127
udev/nvme0n1
```


And read them:
```sh
cd my_log_folder
ls
tail journal
```
Sample output
```
$ ls
df  dmesg  efibootmgr  ip_addr  iptables  journal  lsblk  lsblk-full  lshw  mdstat  mount  multipath  parted  ps  udev
$ tail journal
Feb 25 05:25:28 host-10-31-0-218 NetworkManager[2246]: <info>  [1772015128.2286] policy: auto-activating connection 'Wired connection 2' (6a348203-180b-3870-be2d-dd1c14152966)
Feb 25 05:25:28 host-10-31-0-218 NetworkManager[2246]: <info>  [1772015128.2291] device (enp225s0f0np0): Activation: starting connection 'Wired connection 2' (6a348203-180b-3870-be2d-dd1c14152966)
Feb 25 05:25:28 host-10-31-0-218 NetworkManager[2246]: <info>  [1772015128.2292] device (enp225s0f0np0): state change: disconnected -> prepare (reason 'none', managed-type: 'full')
Feb 25 05:25:28 host-10-31-0-218 NetworkManager[2246]: <info>  [1772015128.2296] device (enp225s0f0np0): state change: prepare -> config (reason 'none', managed-type: 'full')
Feb 25 05:25:28 host-10-31-0-218 NetworkManager[2246]: <info>  [1772015128.2302] device (enp225s0f0np0): state change: config -> ip-config (reason 'none', managed-type: 'full')
Feb 25 05:25:28 host-10-31-0-218 NetworkManager[2246]: <info>  [1772015128.2307] dhcp4 (enp225s0f0np0): activation: beginning transaction (timeout in 30 seconds)
Feb 25 05:25:30 host-10-31-0-218 ironic-python-agent[2363]: 2026-02-25 05:25:30.302 2363 INFO ironic_python_agent.extensions.clean [-] Clean step completed: {'step': 'erase_devices', 'priority': 10, 'interface': 'deploy', 'reboot_requested': False, 'abortable': True, 'requires_ramdisk': True}, result: {'/dev/sda': None, '/dev/sdb': None, '/dev/md127': None, '/dev/nvme0n1': None}
Feb 25 05:25:30 host-10-31-0-218 ironic-python-agent[2363]: 2026-02-25 05:25:30.303 2363 INFO ironic_python_agent.extensions.base [-] Asynchronous command execute_clean_step completed: {'clean_result': {'/dev/sda': None, '/dev/sdb': None, '/dev/md127': None, '/dev/nvme0n1': None}, 'clean_step': {'step': 'erase_devices', 'priority': 10, 'interface': 'deploy', 'reboot_requested': False, 'abortable': True, 'requires_ramdisk': True}}
Feb 25 05:25:30 host-10-31-0-218 systemd[1]: Software RAID monitoring and management was skipped because of an unmet condition check (ConditionPathExists=/etc/mdadm.conf).
Feb 25 05:25:33 host-10-31-0-218 ironic-python-agent[2363]: 2026-02-25 05:25:33.552 2363 INFO ironic_python_agent.utils [-] Collecting system logs and debugging information
```

