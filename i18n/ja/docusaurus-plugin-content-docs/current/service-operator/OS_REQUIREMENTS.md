# OS 要件

OS 要件の一覧です。

## オペレーティングシステム
- Ubuntu Server 24.04（HWE カーネル）

## 必須パッケージ

- `ipmitool` - IPMI 管理
- `lm-sensors` - ハードウェア監視
- `smartmontools` - ディスク健全性監視
- `bridge-utils` - ネットワークブリッジユーティリティ
- `podman` - コンテナランタイム
- `catatonit` - コンテナ用 init
- `python3-podman` - Python Podman バインディング
- `python3-pip` - Python パッケージマネージャー
- `libvirt-clients` - 仮想化ツール
- `ovmf` - VM 向け UEFI ファームウェア
- `chrony` - NTP 時刻同期

## ストレージ設定

### ディスクレイアウト
- 2 台のディスクで RAID1（mdraid）構成
- 両ディスクに GPT パーティションテーブル
- 両ディスクに EFI パーティション（FAT32、約 256MB）
- ルートファイルシステムは RAID1 アレイ上（ext4）
- スワップ無効
- 両ディスクから UEFI ブート

### マウントポイント
- `/` - RAID1 ルートパーティション
- `/boot/efi` - プライマリ EFI パーティション
- `/boot/efi2` - セカンダリ EFI パーティション

## ネットワーク設定

- Netplan v2 設定
- systemd-networkd の `--any` wait-online 動作

### 物理インターフェース
- VLAN トランクインターフェース名を `physical0` とする

### VLAN インターフェース
- `frontend0` - `physical0` 上の VLAN 101（デフォルトゲートウェイ）
- `provisioning0` - `physical0` 上の VLAN 102

## カーネルパラメータ

- `amd_iommu=on` - AMD IOMMU 有効
- `iommu=pt` - IOMMU パススルーモード
- Nouveau ドライバをブラックリスト登録

## サービス

### SSH
- OpenSSH サーバー導入済み
- 鍵認証を設定
- root の SSH アクセスを有効化

### NTP（Chrony）
- カスタム NTP プール設定
- プライマリソースとして pool.ntp.org

## システム設定

- root ユーザー有効
- GRUB recordfail タイムアウト: 3 秒
- Docker ディレクトリを事前作成（`/var/lib/docker`）
- open-iscsi 削除済み
