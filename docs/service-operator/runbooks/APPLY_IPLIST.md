# Apply IP Whitelist Changes

This script handles all the necessary steps to ship a new iplist file to the OpenWRT firewall configuration on the router (`172.20.0.1`). It diffs the incoming file against the one currently deployed on the router, copies it over on confirmation, and triggers a live reload of the ipsets.

No traffic disruption is expected at any point during this process. The `fw4 reload-sets` command updates the active ipsets in-place without restarting the firewall or interrupting existing connections.

---

## Prerequisites Checklist

- [ ] SSH private key available
- [ ] New iplist file ready locally
- [ ] Network access to the router via a jump host

---

## Finding the Target File Path

The target file path on the router (`-d` parameter) can be found via the LuCI web console:

**Network → Firewall → Firewall IPSets**

This shows the active ipsets and their associated file paths.

---

## Step 1: Diff the new file against the current one

Run the script with the `-d` flag pointing to the remote file path identified above:

```bash
bash apply-iplist.sh -i <ssh-key> -j <jump-host> -d <remote-file> <new-iplist-file>
```

Example:

```bash
bash apply-iplist.sh -i ~/.ssh/isys_infra.pem -j root@10.30.0.1 -d /etc/config/iplists/tenant1 tenant1-allowlist.conf
```

The script will print a diff of the remote file versus the local one. Confirm there are no unexpected changes before proceeding.

---

## Step 2: Confirm and apply

If the diff looks correct, type `y` when prompted. The script will:

1. Copy the new file to the router
2. Run `fw4 reload-sets` to apply the changes in-place
3. Run `fw4 print` to confirm the active ipsets reflect the update

---

## Script

```bash
#!/bin/bash
set -euo pipefail

ROUTER="root@172.20.0.1"

usage() {
    echo "Usage: $0 -i <ssh-key> -j <jump-host> -d <remote-file> <new-iplist-file>"
    exit 1
}

SSH_KEY=""
JUMP_HOST=""
REMOTE_FILE=""

while getopts "i:j:d:" opt; do
    case $opt in
        i) SSH_KEY="$OPTARG" ;;
        j) JUMP_HOST="$OPTARG" ;;
        d) REMOTE_FILE="$OPTARG" ;;
        *) usage ;;
    esac
done
shift $((OPTIND - 1))

[[ -z "${SSH_KEY}" || -z "${JUMP_HOST}" || -z "${REMOTE_FILE}" || $# -ne 1 ]] && usage

NEW_FILE="$1"

[[ ! -f "${NEW_FILE}" ]] && { echo "ERROR: File not found: ${NEW_FILE}" >&2; exit 1; }
[[ ! -f "${SSH_KEY}" ]]  && { echo "ERROR: SSH key not found: ${SSH_KEY}" >&2; exit 1; }

PROXY="ProxyCommand ssh -W %h:%p -i ${SSH_KEY} ${JUMP_HOST}"
SSH_OPTS=(-i "${SSH_KEY}" -o "${PROXY}")

echo "=== Step 1: Diff (remote vs local) ==="
REMOTE_TMP=$(mktemp)
if scp -O "${SSH_OPTS[@]}" "${ROUTER}:${REMOTE_FILE}" "${REMOTE_TMP}"; then
    diff "${REMOTE_TMP}" "${NEW_FILE}" || true
else
    echo "WARNING: Could not fetch remote file (may not exist yet). Local file contents:"
    cat "${NEW_FILE}"
fi
rm -f "${REMOTE_TMP}"

echo ""
read -rp "Diff looks correct? Proceed? [y/N] " CONFIRM
[[ "${CONFIRM,,}" != "y" ]] && { echo "Aborted."; exit 1; }

echo ""
echo "=== Step 2: Copy to router ==="
scp -O "${SSH_OPTS[@]}" "${NEW_FILE}" "${ROUTER}:${REMOTE_FILE}"

echo ""
echo "=== Step 3: Reload ipsets (no downtime) ==="
ssh "${SSH_OPTS[@]}" "${ROUTER}" fw4 reload-sets

echo ""
echo "=== Step 4: Validate ==="
ssh "${SSH_OPTS[@]}" "${ROUTER}" fw4 print
```

---

## Troubleshooting

### SSH connection refused or permission denied

Confirm the key is correct and your machine has network access to the jump host. Check that the jump host can reach `172.20.0.1`.

### `scp` fails to fetch remote file

If the remote file does not exist yet (first-time deploy), the diff step will be skipped and the script will show the local file contents instead. Review and confirm before proceeding.

### `fw4 reload-sets` exits with an error

Check the syntax of the new iplist file. A malformed entry will cause `fw4` to reject the reload. Restore the previous file and retry with a corrected version.
