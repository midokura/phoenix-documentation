# Object Store Management

Managing S3-compatible object storage containers and credentials

The platform provides S3-compatible (Simple Storage Service-compatible) object storage for each tenant. You can create named containers (buckets), manage access credentials, and use any standard S3 client to upload, download, and manage objects.

---

## Navigation

Click **Storage** in the left sidebar to open the Shared Storage page. It shows your containers and their sizes. Click **Settings** to manage credentials and view usage.

---

## Managing Credentials

Object storage access uses S3-compatible credentials: an access key and a secret key. You generate these once per tenant and use them with any S3 client.

### Generating Credentials

1. Click **Storage** in the left sidebar.
2. Click **Settings**.
3. Under **Access**, click **Generate Credentials**.
4. Copy both the **Access key** and **Secret key** immediately. The secret key is not shown again after you leave the page.

### Rotating Credentials

Rotating replaces the existing key pair immediately. Any client using the old secret key will lose access at once.

1. In the **Settings** panel, click **Rotate** next to the existing credentials.
2. Confirm the rotation in the dialog.
3. Copy and save the new key pair.

### Deleting Credentials

Deleting revokes all S3 access until new credentials are generated.

1. In the **Settings** panel, click **Delete** next to the credentials.
2. Confirm the deletion.

---

## Managing Containers

Containers are named buckets that hold your objects.

### Creating a Container

1. On the **Storage** page, click **Create Storage**.
2. Enter a container name.
3. Click **Create**.

### Deleting a Container

1. On the **Storage** page, click the delete icon on the container row.
2. If the container is empty, it is deleted immediately.
3. If the container still has objects, a confirmation dialog appears. Enter the container name and click **Force Delete** to remove it along with all its contents.

:::warning

Force-deleting a container permanently removes all objects inside it. This action cannot be undone.

:::

---

## Using an S3 Client

Once you have credentials and a container, you can use any S3-compatible client. The endpoint and region are visible in **Storage > Settings**. All examples in this section can be run directly from a tenant VM — the storage endpoint is reachable from inside the platform network without any additional configuration.

### Finding Your Endpoint

The S3 endpoint URL is shown in **Storage > Settings** under **Access endpoint**.

:::note

The endpoint is only displayed after you have created at least one container. If you see no endpoint, create a container first and then return to **Settings**.

:::

The region must be set to `us-east-1` in your client. This does not affect where your data is stored — it is a required field in the S3 protocol, and `us-east-1` is the value configured for this platform. Your data stays on the local infrastructure where the platform is deployed.

### AWS (Amazon Web Services) CLI (Command-Line Interface)

Configure a named profile:

```bash
aws configure --profile my-storage
# AWS Access Key ID: <your-access-key>
# AWS Secret Access Key: <your-secret-key>
# Default region name: us-east-1
# Default output format: json
```

Use the profile with your endpoint:

```bash
export S3_ENDPOINT="https://<your-endpoint>"

# List containers
aws s3 ls --profile my-storage --endpoint-url "$S3_ENDPOINT" --no-verify-ssl

# Upload a file
aws s3 cp myfile.txt s3://my-container/ --profile my-storage --endpoint-url "$S3_ENDPOINT" --no-verify-ssl

# Download a file
aws s3 cp s3://my-container/myfile.txt . --profile my-storage --endpoint-url "$S3_ENDPOINT" --no-verify-ssl

# Sync a directory
aws s3 sync ./data s3://my-container/data --profile my-storage --endpoint-url "$S3_ENDPOINT" --no-verify-ssl
```

The platform issues certificates from its own internal CA (Certificate Authority), which is not in the default trust store of the AWS CLI. `--no-verify-ssl` bypasses certificate verification but does not disable encryption — your traffic is still encrypted in transit. On a private internal network this is not a security concern, because a MITM (Man-in-the-Middle) attack would require the attacker to already be inside that network. If your environment distributes the platform's CA bundle (a `.crt` or `.pem` file), pass `--ca-bundle /path/to/ca-bundle.crt` instead and omit `--no-verify-ssl`.

### Python (boto3)

boto3 is the Python library for interacting with S3-compatible storage. Install it inside a virtual environment. Use whichever tool you prefer:

```bash
# standard library venv
python -m venv .venv && source .venv/bin/activate

# conda
conda create -n my-env python && conda activate my-env

# uv (fast, drop-in pip replacement)
uv venv && source .venv/bin/activate
```

Then install:

```bash
pip install boto3
```

Create a client pointing to your endpoint:

```python
import boto3
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

s3 = boto3.client(
    "s3",
    endpoint_url="https://<your-endpoint>",   # from Storage > Settings > Access endpoint
    aws_access_key_id="<your-access-key>",
    aws_secret_access_key="<your-secret-key>",
    region_name="us-east-1",
    verify=False,  # disables certificate verification (see note below)
)
```

The connection uses HTTPS, so all traffic between your client and the platform is encrypted in transit — `verify=False` does **not** disable encryption. What it disables is certificate *verification*: the check that the server's TLS certificate was signed by a well-known public Certificate Authority. The platform issues certificates from its own internal CA, which is not in the default trust store of most clients. On a private internal network this is not a security concern, because a MITM attack would require the attacker to already be inside that network. The `urllib3.disable_warnings` call (urllib3 is boto3's underlying HTTP library) suppresses the harmless warnings that `verify=False` triggers. If your environment distributes the platform's CA bundle — a file ending in `.crt` or `.pem` — pass its path as `verify="/path/to/ca-bundle.crt"` instead and remove the `disable_warnings` line.

#### Container operations

```python
# Create a container
s3.create_bucket(Bucket="my-container")

# List all containers
response = s3.list_buckets()
for bucket in response["Buckets"]:
    print(bucket["Name"])

# Delete an empty container
s3.delete_bucket(Bucket="my-container")
```

#### Object operations

```python
# Upload a file from disk
s3.upload_file("myfile.txt", "my-container", "myfile.txt")

# Upload in-memory content directly
s3.put_object(Bucket="my-container", Key="hello.txt", Body=b"Hello, world!")

# List objects in a container
response = s3.list_objects_v2(Bucket="my-container")
for obj in response.get("Contents", []):
    print(obj["Key"], obj["Size"])

# Download a file to disk
s3.download_file("my-container", "myfile.txt", "myfile-downloaded.txt")

# Read an object directly into memory
response = s3.get_object(Bucket="my-container", Key="hello.txt")
content = response["Body"].read()   # bytes

# Delete a single object
s3.delete_object(Bucket="my-container", Key="myfile.txt")

# Delete multiple objects at once
s3.delete_objects(
    Bucket="my-container",
    Delete={
        "Objects": [{"Key": "file1.txt"}, {"Key": "file2.txt"}],
    },
)
```

---

## Server-Side Encryption (SSE-C)

SSE-C lets you encrypt objects using a key you generate and control. The storage service uses your key to encrypt data at rest, but never stores the key itself — only you hold it. This means:

- Nobody but you can read the encrypted objects, even with full server access.
- If you lose the key, the data is permanently unreadable.
- You must supply the same key every time you read the object.
- **SSE-C keys are independent of your S3 credentials.** Rotating your access key and secret key in the console does not affect encrypted objects — you can still read them with the original encryption key and the new S3 credentials.

:::warning

Store your encryption key securely (e.g. a secrets manager, an encrypted file). There is no key recovery mechanism. Losing the key means losing access to all objects encrypted with it.

:::

### Generating an encryption key

```python
import os
import base64

# Generate a random 256-bit (32-byte) AES (Advanced Encryption Standard) key
key_bytes = os.urandom(32)

# Save this to a file or secrets store — you'll need it every time you access the data
with open("my-encryption.key.bin.bin", "wb") as f:
    f.write(key_bytes)

print("Key (base64):", base64.b64encode(key_bytes).decode())
```

Run this once and keep the file safe. Re-use the same `key_bytes` for all uploads you want to decrypt later.

The snippets below assume you already have an `s3` client created as shown in the [Python (boto3)](#python-boto3) section above.

### Uploading an encrypted object

```python
import os

# Load the key you generated earlier
with open("my-encryption.key.bin", "rb") as f:
    key_bytes = f.read()

s3.put_object(
    Bucket="my-container",
    Key="secret-data.txt",
    Body=b"This content is encrypted at rest.",
    SSECustomerAlgorithm="AES256",
    SSECustomerKey=key_bytes,
)
print("Uploaded and encrypted.")
```

boto3 automatically computes the required key checksum — you only need to pass `key_bytes`.

### Downloading an encrypted object

You must provide the same key you used during upload. Without it the request is rejected.

```python
with open("my-encryption.key.bin", "rb") as f:
    key_bytes = f.read()

response = s3.get_object(
    Bucket="my-container",
    Key="secret-data.txt",
    SSECustomerAlgorithm="AES256",
    SSECustomerKey=key_bytes,
)
content = response["Body"].read()
print(content.decode())
```

### Downloading to a file on disk

```python
with open("my-encryption.key.bin", "rb") as f:
    key_bytes = f.read()

s3.download_file(
    "my-container",
    "secret-data.txt",
    "secret-data-local.txt",      # local path to save to
    ExtraArgs={
        "SSECustomerAlgorithm": "AES256",
        "SSECustomerKey": key_bytes,
    },
)
```

### Uploading a local file with encryption

```python
with open("my-encryption.key.bin", "rb") as f:
    key_bytes = f.read()

s3.upload_file(
    "mydata.csv",                  # local file to upload
    "my-container",
    "mydata.csv",                  # name it will have in the container
    ExtraArgs={
        "SSECustomerAlgorithm": "AES256",
        "SSECustomerKey": key_bytes,
    },
)
```

### Managing encryption keys

#### Storing your key safely

Never hardcode a key in a script. The safest options, in increasing order of robustness:

**Environment variable** — good for one-off scripts and CI (Continuous Integration) pipelines:

```python
import os, base64

# Set once in your shell: export SSE_KEY=$(python -c "import os,base64; print(base64.b64encode(os.urandom(32)).decode())")
key_b64 = os.environ["SSE_KEY"]
enc_key = base64.b64decode(key_b64)
```

**Restricted key file** — good for long-lived workloads:

```bash
# Generate and save with strict permissions
python -c "import os; open('my.key','wb').write(os.urandom(32))"
chmod 600 my.key
```

```python
with open("my.key", "rb") as f:
    enc_key = f.read()
```

**Secrets manager** — recommended for production. A secrets manager is a dedicated service for storing and retrieving sensitive values such as passwords and encryption keys. Azure Key Vault is a good fit for this. Store the key as a base64 string secret and retrieve it at runtime via the Azure SDK.

#### Using different keys per object or container

You are not limited to one key. Encrypting different containers or objects with different keys limits the impact if a key is ever compromised — only the objects encrypted with that key are exposed.

```python
# Each dataset gets its own key
with open("dataset-a.key", "rb") as f:
    key_a = f.read()

with open("dataset-b.key", "rb") as f:
    key_b = f.read()

data_a = open("dataset-a.csv", "rb").read()   # your data
data_b = open("dataset-b.csv", "rb").read()

s3.put_object(Bucket="my-container", Key="dataset-a/file.csv", Body=data_a,
              SSECustomerAlgorithm="AES256", SSECustomerKey=key_a)

s3.put_object(Bucket="my-container", Key="dataset-b/file.csv", Body=data_b,
              SSECustomerAlgorithm="AES256", SSECustomerKey=key_b)
```

#### Rotating an encryption key

There is no server-side re-encryption operation available — rotating the key requires downloading the object with the old key and re-uploading it with the new one. For large objects this is bandwidth- and time-intensive, so the best strategy is to keep your encryption keys well-protected to minimise how often rotation is needed.

```python
import os

# Load the current key
with open("my-encryption.key.bin", "rb") as f:
    old_key = f.read()

# Generate a new key
new_key = os.urandom(32)

# Download with the old key
response = s3.get_object(
    Bucket="my-container",
    Key="secret.txt",
    SSECustomerAlgorithm="AES256",
    SSECustomerKey=old_key,
)
data = response["Body"].read()

# Re-upload with the new key (overwrites the object)
s3.put_object(
    Bucket="my-container",
    Key="secret.txt",
    Body=data,
    SSECustomerAlgorithm="AES256",
    SSECustomerKey=new_key,
)

# Only save the new key and discard the old one after confirming the re-upload succeeded
with open("my-encryption.key.bin", "wb") as f:
    f.write(new_key)
```

### Complete example script

The following script shows the full flow from scratch — create a container, generate a key, upload an encrypted file, read it back, and clean up.

```python
import os
import boto3
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

S3_ENDPOINT = "https://<your-endpoint>"
ACCESS_KEY  = "<your-access-key>"
SECRET_KEY  = "<your-secret-key>"
BUCKET      = "my-test-bucket"
OBJECT_KEY  = "hello-encrypted.txt"

s3 = boto3.client(
    "s3",
    endpoint_url=S3_ENDPOINT,
    aws_access_key_id=ACCESS_KEY,
    aws_secret_access_key=SECRET_KEY,
    region_name="us-east-1",
    verify=False,
)

# 1. Create container
s3.create_bucket(Bucket=BUCKET)
print(f"Created bucket: {BUCKET}")

# 2. Generate encryption key (save this — losing it means losing the data)
enc_key = os.urandom(32)

# 3. Upload encrypted object
s3.put_object(
    Bucket=BUCKET,
    Key=OBJECT_KEY,
    Body=b"Hello from ISYS! This is encrypted at rest.",
    SSECustomerAlgorithm="AES256",
    SSECustomerKey=enc_key,
)
print(f"Uploaded encrypted object: {OBJECT_KEY}")

# 4. Read it back (requires the same key)
response = s3.get_object(
    Bucket=BUCKET,
    Key=OBJECT_KEY,
    SSECustomerAlgorithm="AES256",
    SSECustomerKey=enc_key,
)
print("Retrieved content:", response["Body"].read().decode())

# 5. Delete object and bucket
s3.delete_object(Bucket=BUCKET, Key=OBJECT_KEY)
s3.delete_bucket(Bucket=BUCKET)
print("Cleaned up.")
```

---

## Viewing Usage

**Storage > Settings** shows a usage breakdown for:

- **Object Storage**: total objects stored across all containers, with a quota indicator.
- **Block Storage**: volumes attached to your tenant's servers.
