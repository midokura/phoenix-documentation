# Block Storage Setup

Format and mount an additional disk on a Linux VM

This guide explains how to partition, format, mount, and unmount an additional block device (such as an NVMe SSD) attached to a Linux VM.

## Prerequisites

- SSH access to the VM. See [SSH Key Registration](./SSH_KEY_REGISTRATION).
- The VM has one or more unformatted block devices attached.

---

## Identify the disk

List block devices to find the unformatted disk:

```bash
lsblk
```

Disks with no `MOUNTPOINTS` and no partitions listed beneath them are unformatted. In the example below, `nvme1n1` is unformatted:

```
NAME        MAJ:MIN RM  SIZE RO TYPE MOUNTPOINTS
vda         253:0    0   50G  0 disk
└─vda1      253:1    0   50G  0 part /
nvme1n1     259:1    0    7T  0 disk
```

---

## Partition the disk

```bash
sudo fdisk /dev/nvme1n1
```

At the `fdisk` prompt:

1. Type `g` and press Enter to create a new GPT partition table.
2. Type `n` and press Enter to add a new partition.
3. Accept the defaults for partition number, first sector, and last sector by pressing Enter three times.
4. Type `w` and press Enter to write the changes and exit.

This creates a single partition spanning the full disk.

---

## Format the partition

```bash
sudo mkfs.ext4 /dev/nvme1n1p1
```

:::note

This erases all data on the partition. Only run this on a disk you intend to reformat.

:::

---

## Mount the partition

Create a mount point and mount the partition:

```bash
sudo mkdir /mnt/data
sudo mount /dev/nvme1n1p1 /mnt/data
```

The disk is now accessible at `/mnt/data`.

---

## Mount automatically on reboot

Get the partition UUID:

```bash
sudo blkid /dev/nvme1n1p1
```

Add an entry to `/etc/fstab`, replacing `<uuid>` with the value from `blkid`:

```
UUID=<uuid>  /mnt/data  ext4  defaults  0  2
```

Test the fstab entry before rebooting:

```bash
sudo mount -a
```

---

## Unmount the partition

```bash
sudo umount /mnt/data
```

If the disk is in `/etc/fstab` and you no longer want it mounted automatically, remove the corresponding line from that file.

---

## Delete data

To delete all data on the partition, reformat it:

```bash
sudo umount /mnt/data
sudo mkfs.ext4 /dev/nvme1n1p1
```

:::note

This is not a secure wipe. If the disk contains sensitive data, use a dedicated secure-erase tool before decommissioning.

:::

