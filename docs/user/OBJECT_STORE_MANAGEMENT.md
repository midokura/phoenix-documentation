# Object Store Management

Managing S3-compatible object storage containers and credentials

The platform provides S3-compatible object storage (Ceph RGW) for each tenant. You can create named containers (buckets), manage access credentials, and use any standard S3 client to upload, download, and manage objects.

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

Once you have credentials and a container, you can use any S3-compatible client. The endpoint and region are visible in **Storage > Settings**.

### Finding Your Endpoint

The S3 endpoint URL is shown in **Storage > Settings** under **Access endpoint**.

The region is always `us-east-1` (a convention used by Ceph RGW regardless of geographic location).

### AWS CLI

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
aws s3 ls --profile my-storage --endpoint-url "$S3_ENDPOINT"

# Upload a file
aws s3 cp myfile.txt s3://my-container/ --profile my-storage --endpoint-url "$S3_ENDPOINT"

# Download a file
aws s3 cp s3://my-container/myfile.txt . --profile my-storage --endpoint-url "$S3_ENDPOINT"

# Sync a directory
aws s3 sync ./data s3://my-container/data --profile my-storage --endpoint-url "$S3_ENDPOINT"
```

### Python (boto3)

```python
import boto3

s3 = boto3.client(
    "s3",
    endpoint_url="https://<your-endpoint>",
    aws_access_key_id="<your-access-key>",
    aws_secret_access_key="<your-secret-key>",
    region_name="us-east-1",
)

# List objects in a container
response = s3.list_objects_v2(Bucket="my-container")
for obj in response.get("Contents", []):
    print(obj["Key"])

# Upload a file
s3.upload_file("myfile.txt", "my-container", "myfile.txt")

# Download a file
s3.download_file("my-container", "myfile.txt", "myfile-downloaded.txt")
```

---

## Viewing Usage

**Storage > Settings** shows a usage breakdown for:

- **Object Storage**: total objects stored across all containers, with a quota indicator.
- **Block Storage**: volumes attached to your tenant's servers.
