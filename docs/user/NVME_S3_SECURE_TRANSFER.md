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

Run this once on the VM to create a dedicated virtual environment with the required packages.

```bash
python3.13 -m venv ~/.venv-s3transfer
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

S3_ENDPOINT = "https://openstack.isys:6780"
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

---

## Uploading data to S3

### Single large file (model checkpoint, weights, archive)

```python
import os
from pathlib import Path
from tqdm import tqdm
import s3client

KEY_FILE = "/data/my-encryption.key"   # adjust to where you stored your key
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

### Dataset directory

```python
from pathlib import Path
from tqdm import tqdm
import s3client

KEY_FILE   = "/data/my-encryption.key"
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

---

## Downloading data from S3

### Single file

```python
import os
from tqdm import tqdm
import s3client

KEY_FILE = "/data/my-encryption.key"
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

### Directory (all objects under a prefix)

```python
import os
from tqdm import tqdm
import s3client

KEY_FILE   = "/data/my-encryption.key"
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

---

## Verifying a transfer

After uploading or downloading a critical file, verify its integrity by comparing SHA-256 (Secure Hash Algorithm 256-bit) checksums.

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

**Step 1 — before uploading**, compute and save the checksum:

```python
local_file = "/data/runs/exp42/checkpoint_epoch10.pt"
hash_file  = local_file + ".sha256"

checksum = sha256(local_file)
with open(hash_file, "w") as f:
    f.write(checksum)

print(f"SHA-256: {checksum}  (saved to {hash_file})")
```

**Step 2 — after downloading**, load the saved checksum and compare:

```python
restored_file = "/data/runs/exp42/checkpoint_epoch10.pt"
hash_file     = restored_file + ".sha256"

with open(hash_file) as f:
    original_checksum = f.read().strip()

if sha256(restored_file) == original_checksum:
    print("Integrity check passed — files are identical.")
else:
    print("WARNING: checksums do not match — transfer may be corrupted.")
```

:::note

Upload the `.sha256` file to S3 alongside the data file — use `s3.upload_file(hash_file, BUCKET, object_key + ".sha256")` in your upload script so the checksum travels with the data and is always available when you restore.

:::

---

## Key safety reminder

:::warning

The encryption key at `KEY_FILE` is the only thing that can decrypt your data on S3. Back it up to a secure location (such as Azure Key Vault) before starting any long-running experiment. If the key is lost, the data on S3 is permanently unreadable — there is no recovery option.

:::
