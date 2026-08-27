---
sidebar_position: 2
---

# Securely Transferring Data Between NVMe and Object Storage

Step-by-step guide for copying data from a Jumbo VM's local NVMe (Non-Volatile Memory Express) storage to S3-compatible object storage and back, with SSE-C (Server-Side Encryption with Customer-Provided Keys) encryption throughout.

Typical use cases: uploading model checkpoints and validation datasets before a run, archiving results, restoring a dataset for a new experiment.

---

## Prerequisites

- You are logged into your Jumbo VM via SSH (Secure Shell).
- You have S3 credentials (access key and secret key) from **Storage > Settings** in the console. See [Object Store Management](./OBJECT_STORE_MANAGEMENT) if you need to generate them.
- You have generated an SSE-C encryption key and stored it safely. See [Generating an encryption key](./OBJECT_STORE_MANAGEMENT#generating-an-encryption-key).
- Your data lives under `/data` (the local NVMe mount). Adjust this path if your mount point differs.

---

## One-time setup

### Python

Run this once on the VM to create a dedicated virtual environment with the required packages.

```bash
sudo apt install python3-venv
python3 -m venv ~/.venv-s3transfer
source ~/.venv-s3transfer/bin/activate
pip install boto3 tqdm
```

Activate the environment before each session:

```bash
source ~/.venv-s3transfer/bin/activate
```

Create a reusable client module — save this as `s3client.py` in the same directory as your scripts and fill in your credentials once:

```python
import boto3
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

S3_ENDPOINT = "https://openstack.tld:6780"  # from Storage > Settings > Access endpoint
REGION      = "us-east-1"
ACCESS_KEY  = "<your-access-key>"   # from Storage > Settings > Access key
SECRET_KEY  = "<your-secret-key>"   # from Storage > Settings > Secret key

def get_client():
    return boto3.client(
        "s3",
        endpoint_url=S3_ENDPOINT,
        aws_access_key_id=ACCESS_KEY,
        aws_secret_access_key=SECRET_KEY,
        region_name=REGION,
        verify=False,
    )
```

Restrict the file's permissions so only your user can read it:

```bash
chmod 600 s3client.py
```

### AWS CLI

The commands in this guide have been validated with `aws-cli/2.36.30`.

Configure a named profile with your S3 credentials:

```bash
aws configure --profile my-storage
# AWS Access Key ID: <your-access-key>
# AWS Secret Access Key: <your-secret-key>
# Default region name: us-east-1
# Default output format: json
```

If you have not yet generated an encryption key, create one with OpenSSL:

```bash
openssl rand -out /data/my-encryption.key.bin 32
chmod 600 /data/my-encryption.key.bin
```

Set two shell variables you will reuse in every command:

```bash
export S3_ENDPOINT="https://openstack.tld:6780"   # from Storage > Settings > Access endpoint
export KEY_FILE="/data/my-encryption.key.bin"
```

`KEY_FILE` is the path to your binary key file. The `fileb://` prefix used in every CLI command tells the AWS CLI to read it as binary and handle the encoding internally, which avoids the encoding issues that arise when passing a pre-encoded key string. Add both exports to your `~/.bashrc` or re-run them at the start of each session.

:::note

All CLI examples below pass `--no-verify-ssl`. The platform issues certificates from its own internal CA (Certificate Authority), which is not in the default trust store of the AWS CLI. `--no-verify-ssl` bypasses certificate verification but does not disable encryption — your traffic is still encrypted in transit. On a private internal network this is not a security concern. If your environment distributes the platform's CA bundle (a `.crt` or `.pem` file), pass `--ca-bundle /path/to/ca-bundle.crt` instead and omit `--no-verify-ssl`.

:::

---

## Uploading data to S3

### Single large file (model checkpoint, weights, archive)

**Python**

```python
#!/usr/bin/env python3
# upload_file.py
import os
from pathlib import Path
from tqdm import tqdm
import s3client

KEY_FILE = "/data/my-encryption.key.bin"   # adjust to where you stored your key
BUCKET   = "my-model-bucket"

# Load encryption key
with open(KEY_FILE, "rb") as f:
    enc_key = f.read()

s3 = s3client.get_client()

def upload_file(local_path: str, object_key: str):
    size = os.path.getsize(local_path)
    with tqdm(total=size, unit="B", unit_scale=True, desc=Path(local_path).name) as bar:
        s3.upload_file(
            local_path,
            BUCKET,
            object_key,
            ExtraArgs={
                "SSECustomerAlgorithm": "AES256",
                "SSECustomerKey": enc_key,
            },
            Callback=lambda n: bar.update(n),
        )
    print(f"Uploaded: {local_path} → s3://{BUCKET}/{object_key}")

# Example: upload a checkpoint
upload_file("/data/runs/exp42/checkpoint_epoch10.pt", "exp42/checkpoint_epoch10.pt")
```

**AWS CLI**

```bash
aws s3 cp /data/runs/exp42/checkpoint_epoch10.pt \
    s3://my-model-bucket/exp42/checkpoint_epoch10.pt \
    --sse-c AES256 --sse-c-key "fileb://$KEY_FILE" \
    --profile my-storage --endpoint-url "$S3_ENDPOINT" --no-verify-ssl
```

### Dataset directory

**Python**

```python
#!/usr/bin/env python3
# upload_dir.py
from pathlib import Path
from tqdm import tqdm
import s3client

KEY_FILE   = "/data/my-encryption.key.bin"
BUCKET     = "my-model-bucket"
LOCAL_DIR  = "/data/datasets/imagenet-val"  # adjust to your dataset path
S3_PREFIX  = "datasets/imagenet-val"        # prefix (folder) inside the bucket

with open(KEY_FILE, "rb") as f:
    enc_key = f.read()

s3 = s3client.get_client()

files = [p for p in Path(LOCAL_DIR).rglob("*") if p.is_file()]
print(f"Uploading {len(files)} files from {LOCAL_DIR} ...")

for file_path in tqdm(files, unit="file"):
    relative = file_path.relative_to(LOCAL_DIR)
    object_key = f"{S3_PREFIX}/{relative}"
    s3.upload_file(
        str(file_path),
        BUCKET,
        object_key,
        ExtraArgs={
            "SSECustomerAlgorithm": "AES256",
            "SSECustomerKey": enc_key,
        },
    )

print("Upload complete.")
```

**AWS CLI**

```bash
aws s3 sync /data/datasets/imagenet-val \
    s3://my-model-bucket/datasets/imagenet-val \
    --sse-c AES256 --sse-c-key "fileb://$KEY_FILE" \
    --profile my-storage --endpoint-url "$S3_ENDPOINT" --no-verify-ssl
```

---

## Downloading data from S3

### Single file

**Python**

```python
#!/usr/bin/env python3
# download_file.py
import os
from tqdm import tqdm
import s3client

KEY_FILE = "/data/my-encryption.key.bin"
BUCKET   = "my-model-bucket"

with open(KEY_FILE, "rb") as f:
    enc_key = f.read()

s3 = s3client.get_client()

def download_file(object_key: str, local_path: str):
    os.makedirs(os.path.dirname(local_path) or ".", exist_ok=True)
    meta = s3.head_object(
        Bucket=BUCKET,
        Key=object_key,
        SSECustomerAlgorithm="AES256",
        SSECustomerKey=enc_key,
    )
    size = meta["ContentLength"]
    with tqdm(total=size, unit="B", unit_scale=True, desc=object_key) as bar:
        s3.download_file(
            BUCKET,
            object_key,
            local_path,
            ExtraArgs={
                "SSECustomerAlgorithm": "AES256",
                "SSECustomerKey": enc_key,
            },
            Callback=lambda n: bar.update(n),
        )
    print(f"Downloaded: s3://{BUCKET}/{object_key} → {local_path}")

# Example: restore a checkpoint
download_file("exp42/checkpoint_epoch10.pt", "/data/runs/exp42/checkpoint_epoch10.pt")
```

**AWS CLI**

```bash
aws s3 cp s3://my-model-bucket/exp42/checkpoint_epoch10.pt \
    /data/runs/exp42/checkpoint_epoch10.pt \
    --sse-c AES256 --sse-c-key "fileb://$KEY_FILE" \
    --profile my-storage --endpoint-url "$S3_ENDPOINT" --no-verify-ssl
```

### Directory (all objects under a prefix)

**Python**

```python
#!/usr/bin/env python3
# download_dir.py
import os
from tqdm import tqdm
import s3client

KEY_FILE   = "/data/my-encryption.key.bin"
BUCKET     = "my-model-bucket"
S3_PREFIX  = "datasets/imagenet-val"        # prefix to restore
LOCAL_DIR  = "/data/datasets/imagenet-val"  # destination on NVMe

with open(KEY_FILE, "rb") as f:
    enc_key = f.read()

s3 = s3client.get_client()

# S3 returns results in pages; the paginator fetches all of them automatically
paginator = s3.get_paginator("list_objects_v2")
objects = []
for page in paginator.paginate(Bucket=BUCKET, Prefix=S3_PREFIX):
    objects.extend(page.get("Contents", []))

print(f"Downloading {len(objects)} objects to {LOCAL_DIR} ...")

for obj in tqdm(objects, unit="file"):
    key = obj["Key"]
    # Reconstruct the local path by stripping the S3 prefix
    relative = key[len(S3_PREFIX):].lstrip("/")
    local_path = os.path.join(LOCAL_DIR, relative)
    os.makedirs(os.path.dirname(local_path), exist_ok=True)
    s3.download_file(
        BUCKET,
        key,
        local_path,
        ExtraArgs={
            "SSECustomerAlgorithm": "AES256",
            "SSECustomerKey": enc_key,
        },
    )

print("Download complete.")
```

**AWS CLI**

```bash
aws s3 sync s3://my-model-bucket/datasets/imagenet-val \
    /data/datasets/imagenet-val \
    --sse-c AES256 --sse-c-key "fileb://$KEY_FILE" \
    --profile my-storage --endpoint-url "$S3_ENDPOINT" --no-verify-ssl
```

---

## Verifying a transfer

After uploading or downloading a critical file, verify its integrity by comparing SHA-256 (Secure Hash Algorithm 256-bit) checksums. Always store the `.sha256` checksum file alongside the data in S3 so it is available when you restore.

**Python**

Both steps below use the same helper — add it once at the top of each script:

```python
import hashlib

def sha256(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(8 * 1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()
```

**Step 1 — before uploading**, compute, save, and upload the checksum:

```python
local_file = "/data/runs/exp42/checkpoint_epoch10.pt"
hash_file  = local_file + ".sha256"

checksum = sha256(local_file)
with open(hash_file, "w") as f:
    f.write(checksum)

print(f"SHA-256: {checksum}  (saved to {hash_file})")

s3 = s3client.get_client()
s3.upload_file(hash_file, "my-model-bucket", "exp42/checkpoint_epoch10.pt.sha256")
```

**Step 2 — after downloading**, load the saved checksum and compare:

```python
restored_file = "/data/runs/exp42/checkpoint_epoch10.pt"
hash_file     = restored_file + ".sha256"

# If restoring on a different machine, download the checksum file first:
# s3.download_file("my-model-bucket", "exp42/checkpoint_epoch10.pt.sha256", hash_file)

with open(hash_file) as f:
    original_checksum = f.read().strip()

if sha256(restored_file) == original_checksum:
    print("Integrity check passed — files are identical.")
else:
    print("WARNING: checksums do not match — transfer may be corrupted.")
```

**AWS CLI**

**Step 1 — before uploading**, compute, save, and upload the checksum:

```bash
sha256sum /data/runs/exp42/checkpoint_epoch10.pt \
    > /data/runs/exp42/checkpoint_epoch10.pt.sha256

aws s3 cp /data/runs/exp42/checkpoint_epoch10.pt.sha256 \
    s3://my-model-bucket/exp42/checkpoint_epoch10.pt.sha256 \
    --profile my-storage --endpoint-url "$S3_ENDPOINT" --no-verify-ssl
```

**Step 2 — after downloading**, fetch the checksum file and verify:

```bash
aws s3 cp s3://my-model-bucket/exp42/checkpoint_epoch10.pt.sha256 \
    /data/runs/exp42/checkpoint_epoch10.pt.sha256 \
    --profile my-storage --endpoint-url "$S3_ENDPOINT" --no-verify-ssl

sha256sum -c /data/runs/exp42/checkpoint_epoch10.pt.sha256
```

A passing check prints `OK`; a mismatch prints `FAILED`.

---

## Key safety reminder

:::warning

Your encryption key file is the only thing that can decrypt your data on S3. Back it up to a secure location (such as Azure Key Vault) before starting any long-running experiment. If the key is lost, the data on S3 is permanently unreadable — there is no recovery option.

:::
