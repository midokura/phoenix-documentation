 # Ceph のセットアップ（汎用）

Ceph クラスタをベアメタルノード上にインストールします。

本手順では、podman をオーケストレーションマネージャとして、ベアメタルノード上に Ceph クラスタをインストールする方法を説明します。本デプロイ方法は、アップストリームで公式に推奨されています。

### 事前確認事項

- **"OS ip address"**: 本ガイドでは、各ノードの OS IP アドレスを環境変数 `OS_IP_ADDRESS_X` で指定します。`X` はノード番号（1〜3）です。例：`192.168.6.204`
- **"OS host"**: 各ノードのホスト名は環境変数 `HOSTNAME_X` で指定します。`X` はノード番号です。各サーバーのホスト名を設定してください。
- **"Cluster network subnet"**: クラスタネットワークのサブネットは環境変数 `CLUSTER_SUBNET` で指定します。例：`172.28.6.0/24`

## インストール

### 1. メインの Ceph ノードに接続します

```bash
ssh -A ubuntu@$OS_IP_ADDRESS_1
```

### 2. cephadm パッケージをインストールします

```bash
apt install -y cephadm
```

### 3. UUID を生成します

```bash
UUID="$(uuidgen)"
```

### 4. クラスタの 1 台目のノードを bootstrap します

（FSID は `uuidgen` を使用して生成できます）

```bash
cephadm bootstrap --mon-ip $OS_IP_ADDRESS_1 --cluster-network $CLUSTER_SUBNET --fsid $UUID
```

### 5. Ceph Dashboard にアクセスします

コマンドの出力に表示される Ceph Dashboard のデフォルト URL、ユーザー名、パスワードを確認します。
その情報を使用して Dashboard にアクセスし、ログイン後にパスワードを変更してください。

### 6. Ceph 管理者の公開 SSH キーを残りのノードへ登録します

bootstrap を実行しているノードの `/etc/ceph/ceph.pub` の内容を取得し、すべての Ceph ホストの root ユーザーの `/root/.ssh/authorized_keys` ファイルに追加します。

### 7. 残りのノードを 1 台目のノードから追加し、admin ノードとしても設定します

```bash
sudo cephadm shell -- ceph orch host add $HOSTNAME_2 $OS_IP_ADDRESS_2 --labels _admin
sudo cephadm shell -- ceph orch host add $HOSTNAME_3 $OS_IP_ADDRESS_3 --labels _admin
sudo cephadm shell -- ceph orch host ls
```

### 8. OSD を追加する前にディスクを zap（消去）します

```bash
sudo cephadm shell
ceph orch device zap $HOSTNAME_1 /dev/sdX --force
```

### 9. 専用ディスクデバイスのクラスタへの追加を開始します

Ceph ストレージとして使用する各ディスクについて、専用ディスクデバイスをクラスタに追加します。 `/dev/sdX` は各ディスクを示します。

```bash
sudo cephadm shell
ceph orch daemon add osd --method raw $HOSTNAME_1:/dev/sdX
ceph orch daemon add osd --method raw $HOSTNAME_2:/dev/sdX
ceph orch daemon add osd --method raw $HOSTNAME_3:/dev/sdX
```

### 10. rados gateway を起動します

```bash
sudo cephadm shell
ceph orch apply rgw gateway --placement="3 $HOSTNAME_1 $HOSTNAME_2 $HOSTNAME_3" --port=8080
```

Keystone 連携を設定します:

```bash
# https://docs.ceph.com/en/latest/radosgw/keystone/

# Queens リリース以降、Keystone は Identity API v3 のみをサポートしています。
# Identity API v2.0 のサポートは Queens で廃止され、Identity API v3 に統一されています。
# https://docs.openstack.org/keystone/latest/contributor/http-api.html

ceph config set client.rgw.gateway rgw_keystone_api_version 3
ceph config set client.rgw.gateway rgw_keystone_url http://$OPENSTACK_URL:5000
ceph config set client.rgw.gateway rgw_keystone_admin_user ceph_rgw
ceph config set client.rgw.gateway rgw_keystone_admin_domain Default
ceph config set client.rgw.gateway rgw_keystone_admin_project service

# https://tracker.ceph.com/issues/21226 の影響を回避するため、トークンキャッシュを無効化します
ceph config set client.rgw.gateway rgw_keystone_token_cache_size 0

#ceph config set client.rgw.gateway rgw_keystone_verify_ssl false
ceph config set client.rgw.gateway rgw_enable_usage_log true # ログ出力

# https://docs.ceph.com/en/latest/radosgw/multitenancy/#swift-with-keystone
ceph config set client.rgw.gateway rgw_keystone_implicit_tenants true

# オプション
ceph config set client.rgw.gateway rgw_swift_account_in_url false

# https://docs.ceph.com/en/latest/radosgw/s3/authentication/
ceph config set client.rgw.gateway rgw_s3_auth_use_keystone true
```

### 11. rados gateway ユーザーを作成します

以下のコマンドを実行して、Ceph Object Gateway 管理 API 用のユーザーを作成します。

```bash
radosgw-admin user create --uid="iaas-rgw-admin" --display-name="iaas management user for ceph object gateway admin API" --caps="users=*;buckets=*;usage=*;metadata=*"
```

#### a. access key と secret key を控えておきます

#### b. 以下のコマンドで暗号化し、inventory.yml の `rgw_auth.access_key` と `rgw_auth.secret_key` を更新します

```bash
ansible-vault encrypt_string --ask-vault-password $ACCESS_KEY --name access_key
ansible-vault encrypt_string --ask-vault-password $SECRET_KEY --name secret_key
```

### 12. OpenStack の設定が生成された後、cephadm に戻って次のコマンドを実行します

```bash
sudo cephadm shell
ansible-vault view passwords.yml | grep ceph_rgw_keystone_password
ceph config set client.rgw.gateway rgw_keystone_admin_password <ceph_rgw_keystone_password from passwords.yml>
ceph orch restart rgw.gateway
```

## 設定および利用

### 1. イメージ用のプールを作成します

```bash
ceph osd pool create images 32 32 replicated
ceph osd pool set images size 2

ceph osd pool create volumes 32 32 replicated
ceph osd pool set volumes size 2

ceph osd pool create vms 32 32 replicated
ceph osd pool set vms size 2

ceph osd pool create backups 32 32 replicated
ceph osd pool set backups size 2

mkdir -p keyrings

ceph auth get-or-create client.cinder mon 'allow r' osd 'allow class-read object_prefix rbd_children, allow rwx pool=volumes, allow rwx pool=vms, allow rx pool=images' | tr -d '\t' > keyrings/ceph.client.cinder.keyring
echo >> keyrings/ceph.client.cinder.keyring

ceph auth get-or-create client.cinder-backup mon 'allow r' osd 'allow class-read object_prefix rbd_children, allow rwx pool=backups' | tr -d '\t' > keyrings/ceph.client.cinder-backup.keyring
echo >> keyrings/ceph.client.cinder-backup.keyring

ceph auth get-or-create client.glance mon 'allow r' osd 'allow class-read object_prefix rbd_children, allow rwx pool=images' | tr -d '\t' > keyrings/ceph.client.glance.keyring
echo >> keyrings/ceph.client.glance.keyring
```

### 2. keyrings ディレクトリを保存します

keyrings ディレクトリを永続的な場所に保存してください。  
このディレクトリは [DEPLOYMENT](./DEPLOYMENT.md) セクションで使用します。

**重要:** 保存後は keyrings ディレクトリを削除してください。

```bash
rm -rf keyrings
```

### 3. 各プールで rbd を有効化します

```bash
ceph osd pool application enable images rbd
ceph osd pool application enable volumes rbd
ceph osd pool application enable vms rbd
ceph osd pool application enable backups rbd
```
