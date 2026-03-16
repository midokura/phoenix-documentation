# GPU サーバーの検証

ML ワークロードを実行する前に GPU サーバー構成を検証します。

新たにデプロイした GPU ベアメタルサーバーで高コストな分散学習ワークロードを開始する前に、ソフトウェアスタックが正しく構成されていることを確認する必要があります。本ガイドでは、事前インストール済みの検証スクリプトを使用して、GPU、RDMA、および GPUDirect RDMA の構成を確認する方法を説明します。

## クイック検証チェックリスト

検証を漏れなく行うには、以下のコマンドシーケンスを実行します。

```bash
nvidia-smi                    # GPU detected?
source /opt/pytorch-venv/bin/activate
python -c "import torch; print(f'CUDA available: {torch.cuda.is_available()}')"
verify-rdma                   # RDMA stack configured?
verify-gpudirect              # GPUDirect RDMA ready?
test-nccl                     # Single-server test (requires 2+ GPUs)
```

> **注記：** RDMA の検証はマルチサーバー分散学習の場合のみ必要です。単一サーバーのワークロード（マルチ GPU を含む）の場合は、GPU 検証（`nvidia-smi` および PyTorch CUDA チェック）のみで十分です。

マルチサーバー検証については [test-nccl](#test-nccl) を参照してください。

## 技術仕様

GPU サーバーのソフトウェアスタック仕様です。

| コンポーネント | バージョン/詳細 |
|-----------|-----------------|
| ベース OS | Ubuntu 24.04（kernel 6.8 以上） |
| NVIDIA ドライバー | v570.x（オープンソース版、Canonical リポジトリ） |
| CUDA | v12.8 ランタイムおよび開発パッケージ |
| RDMA 方式 | inbox カーネルドライバーを使用した DMA-BUF |
| RDMA パッケージ | rdma-core、ibverbs-utils、infiniband-diags、perftest |
| NCCL | RoCE 用に事前構成済み（TC 104 / DSCP 26） |
| PyTorch 環境 | /opt/pytorch-venv（Python 3.12、PyTorch 2.8.0+cu128） |
| モニタリング | node_exporter（9100）、dcgm-exporter（9400） |

## 検証スクリプト リファレンス

### nvidia-smi

**目的**：NVIDIA ドライバーがロードされ、GPU が認識されていることを確認します。

**確認タイミング**：デプロイ直後の最初の確認として実行してください。失敗した場合は、GPU の認識またはドライバーのインストールで発生している問題を解決します。

**確認内容**：
- NVIDIA ドライバーがロードされているか
- OS がGPU デバイスを認識しているか
- GPU メモリおよび演算能力

**ハードウェア要件**：NVIDIA GPU が正しく設置・認識されていること。

#### 実行方法

```bash
nvidia-smi
```

**期待値**:

```
+-----------------------------------------------------------------------------------------+
| NVIDIA-SMI 570.124.06             Driver Version: 570.124.06     CUDA Version: 12.8     |
|-----------------------------------------+------------------------+----------------------+
| GPU  Name                 Persistence-M | Bus-Id          Disp.A | Volatile Uncorr. ECC |
| Fan  Temp   Perf          Pwr:Usage/Cap |           Memory-Usage | GPU-Util  Compute M. |
|                                         |                        |               MIG M. |
|=========================================+========================+======================|
|   0  NVIDIA H100 80GB HBM3          Off |   00000000:17:00.0 Off |                    0 |
| N/A   30C    P0             70W /  700W |       0MiB /  81559MiB |      0%      Default |
|                                         |                        |             Disabled |
+-----------------------------------------+------------------------+----------------------+
```

**結果の確認方法**
- すべての GPU が、正しいメモリ容量とともに表示されている
- CUDA のバージョンが 12.8 以降である
- アイドル時は、消費電力が低く、温度が低く、メモリ使用量がない状態である

#### トラブルシューティング

1. **GPU が検出されない**

    - **症状**: `nvidia-smi` を実行すると "No devices were found" と表示される、またはコマンドが見つからないと表示される。
    - **確認事項**:
      ```bash
     # ドライバーがロードされているか確認
     lsmod | grep nvidia

     # PCI デバイスに NVIDIA GPU が表示されているか確認
     lspci | grep -i nvidia

     # ドライバーのインストール状況を確認
     dpkg -l | grep nvidia-driver
     ```
   - **対処方法**:
     - PCI デバイスが見つからない場合: BIOS 設定を確認（PCIe スロットが有効になっているか）または GPU が正しく装着されているか確認します
     - ドライバーがロードされていない場合: NVIDIA ドライバーをインストールします（`apt install nvidia-driver-570-open`）
     - `nvidia-smi` が見つからない場合: CUDA ツールキットをインストールします（`apt install nvidia-utils-570`）

----

### PyTorch CUDA 検証

**目的**: PyTorch 環境と CUDA ランタイムの統合が正しく動作しているか確認します。

**使用するタイミング**: `nvidia-smi` が正常に動作することを確認した後に実行します。Python 環境から GPU にアクセスできるかを確認します。

**確認内容**:
- PyTorch 仮想環境（venv）の有効化
- PyTorch における CUDA の利用可否
- GPU デバイス数
- GPU 上での基本的なテンソル演算

**ハードウェア依存関係**: CUDA ランタイムがインストールされた NVIDIA GPU

#### 実行方法

```bash
source /opt/pytorch-venv/bin/activate
python -c "import torch; print(f'CUDA available: {torch.cuda.is_available()}'); print(f'GPU count: {torch.cuda.device_count()}')"
```

**期待される出力**:

```
CUDA available: True
GPU count: 8
```

**結果の解釈**:
- `CUDA available: True` は、PyTorch が CUDA を利用できることを示します
- GPU 数が実際のハードウェア構成と一致していることを確認してください

----

### verify-rdma

**目的**: マルチサーバー分散トレーニングに向けて、RDMA ネットワークスタックの設定を検証します。

**使用するタイミング**: GPU のチェックが正常に完了した後に実行します。マルチサーバートレーニングに参加するサーバーで有用です。

**確認内容**:
- Inbox カーネルモジュール（ib_core、rdma_cm、ib_uverbs、mlx5_core、mlx5_ib）
- ibv_devinfo によって検出された RDMA デバイス
- RDMA リンク状態（アクティブなポート）
- MTU 設定（現在の値とサポートされている最大値）
- RoCE v2 トラフィッククラス QoS 設定（ToS 104 / DSCP 26 / TC3）
- rdma-cm-tos.service の状態
- NCCL 環境変数

**ハードウェア依存関係**: RoCE v2 に対応した Mellanox ConnectX-4 以降の NIC が必要です。ネットワークスイッチ側でロスレス Ethernet の設定が必要です。

#### 実行方法

```bash
verify-rdma
```

**期待される出力**（Mellanox NIC ハードウェアを使用している場合）:

```
==========================================
Inbox RDMA カーネルモジュール
==========================================
[OK] ib_core loaded
[OK] rdma_cm loaded
[OK] ib_uverbs loaded
[OK] mlx5_core loaded
[OK] mlx5_ib loaded

==========================================
RDMA デバイス
==========================================
[OK] mlx5_0 port 1: PORT_ACTIVE
[OK] RDMA リンクが確認されました

--- rdma link show ---
link mlx5_0/1 state ACTIVE physical_state LINK_UP netdev ens1f0np0

==========================================
MTU 設定
==========================================
[OK] mlx5_0 port 1: active_mtu=4096 (max supported)

==========================================
RoCE トラフィッククラス（QoS）
==========================================
ロスレス RoCE には適切な QoS 設定が必要です。
ロスレス RoCE 用のトラフィッククラス（ToS 104 = DSCP 26 = TC3）

[OK] rdma-cm-tos.service is enabled
[OK] rdma-cm-tos.service is active
[OK] mlx5_0: RDMA-CM ToS=104 (DSCP 26 = TC3)

NCCL トラフィッククラス設定:
[OK] NCCL_IB_TC=104 configured in /etc/profile.d/nccl-rdma.sh

==========================================
結果
==========================================
OK: 10  WARN: 0  FAIL: 0
```

**結果の解釈**:
- **[OK]**: コンポーネントが正しく設定されています
- **[WARN]**: コンポーネントは検出されていますが、最適な設定ではありません。調査が必要ですが、基本的な機能の動作を妨げない場合があります
- **[FAIL]**: RDMA が正常に動作するために修正が必要な設定問題があります

ベアメタル GPU サーバーでは、ほとんどの結果が `[OK]` になるはずです。`[FAIL]` が表示されている場合は、修正が必要な設定ミスを示しています。

#### トラブルシューティング

1. **RDMA 検証で FAIL（WARN ではなく）が表示される場合**

   - **症状**: Mellanox NIC を搭載したインスタンスで `verify-rdma` を実行すると `[FAIL]` が表示される。
   - **確認事項**:
     ```bash
     # NIC が検出されているか確認
     lspci | grep -i mellanox

     # カーネルモジュールの確認
     lsmod | grep mlx5

     # dmesg にエラーが出ていないか確認
     dmesg | grep -i mlx5
     ```
   - **対処方法**:
     - `lspci` に NIC が表示されない場合: ハードウェアが検出されていません。PCIe スロットや BIOS 設定を確認してください
     - モジュールがロードされていない場合: `modprobe mlx5_core && modprobe mlx5_ib`
     - ibverbs-utils がインストールされていない場合: `apt install ibverbs-utils infiniband-diags`

----

### verify-gpudirect

**目的**: DMA-BUF を使用した GPUDirect RDMA の設定を検証します。

**使用するタイミング**: GPU と RDMA のチェックがいずれも正常に完了した後に実行します。GPU メモリが RDMA NIC から直接アクセス可能かを確認します。

**確認内容**:
- NVIDIA ドライバーの状態および GPU の検出状況
- カーネルの P2PDMA サポート（CONFIG_PCI_P2PDMA=y）
- nvidia-open ドライバー（DMA-BUF に必須）
- カーネルバージョンの互換性（DMA-BUF を完全にサポートするために 6.2 以降）
- legacy nvidia-peermem の状態（ロードされていないこと）
- NCCL 環境変数
- PyTorch の NCCL バックエンド利用可否

**ハードウェア依存関係**: NVIDIA GPU と Mellanox ConnectX NIC の両方が必要です。最適なパフォーマンスを得るには、GPU と NIC が同じ PCI スイッチまたは NUMA ノード上にあることが推奨されます。

#### 実行方法

```bash
verify-gpudirect
```

**期待される出力**（GPU と Mellanox NIC を使用している場合）:

```
==========================================
NVIDIA ドライバーの状態
==========================================
570.124.06, NVIDIA H100 80GB HBM3, 81559 MiB
[OK] NVIDIA GPU が検出され、ドライバーがロードされています

==========================================
DMA-BUF サポート（NVIDIA 推奨方式）
==========================================
DMA-BUF は GPUDirect RDMA の最新の方式です。
必要条件: nvidia-open ドライバー + CONFIG_PCI_P2PDMA=y を有効化したカーネル

[OK] カーネルで CONFIG_PCI_P2PDMA=y が有効（P2P DMA 有効）

[OK] nvidia-open ドライバーを使用中（DMA-BUF 対応）

[OK] カーネル 6.8 は DMA-BUF をサポート（6.2 以降が必要）

==========================================
Legacy nvidia-peermem（未使用）
==========================================
[OK] nvidia-peermem はロードされていません（代わりに DMA-BUF を使用）

==========================================
NCCL 環境変数
==========================================
現在の環境変数から読み込まれた NCCL 設定:
  NCCL_DEBUG=INFO
  NCCL_IB_DISABLE=0
  NCCL_IB_TC=104
  NCCL_NET_GDR_LEVEL=SYS
  NCCL_P2P_LEVEL=NVL

[OK] NCCL 変数は /etc/profile.d/nccl-rdma.sh に設定されています

==========================================
PyTorch NCCL チェック
==========================================
PyTorch で NCCL が利用可能かテスト中...
  NCCL available: True
  NCCL backend can be used for distributed training
[OK] PyTorch NCCL バックエンドが利用可能

==========================================
結果
==========================================
OK: 8  WARN: 0  FAIL: 0

RDMA テスト（ネットワークのみ）:
  # Server: ib_write_bw -d mlx5_0
  # Client: ib_write_bw -d mlx5_0 <server-ip>

NCCL を使用した GPUDirect テスト（単一ノード、GPU 2枚以上）:
  source /opt/pytorch-venv/bin/activate
  torchrun --nproc_per_node=2 /usr/local/bin/test-nccl

NCCL を使用した GPUDirect テスト（マルチノード）:
  # Node 0: torchrun --nproc_per_node=<gpus> --nnodes=2 --node_rank=0 \
  #           --master_addr=<master_ip> --master_port=29500 /usr/local/bin/test-nccl
  # Node 1: torchrun --nproc_per_node=<gpus> --nnodes=2 --node_rank=1 \
  #           --master_addr=<master_ip> --master_port=29500 /usr/local/bin/test-nccl

確認ポイント: 'DMA-BUF is available', 'Using network IB', 'GDR 1'
```

**結果の解釈**:
- DMA-BUF サポートには次の 3 つの要素が必要です: nvidia-open ドライバー、カーネルの P2PDMA サポート、カーネル 6.2 以降
- DMA-BUF を使用する場合、legacy nvidia-peermem はロードされていない必要があります
- ロスレス RoCE のために、NCCL 環境変数が正しい値で設定されている必要があります

#### トラブルシューティング

1. **GPUDirect 検証に失敗する**

   - **症状**: `verify-gpudirect` の実行結果で、nvidia-open ドライバーが検出されない、または P2PDMA が有効になっていないと表示される。
   - **確認事項**:
     ```bash
     # nvidia-open ドライバーがインストールされているか確認
     dpkg -l | grep nvidia-driver | grep open

     # カーネルの P2PDMA サポートを確認
     grep CONFIG_PCI_P2PDMA /boot/config-$(uname -r)

     # カーネルバージョンを確認
     uname -r
     ```
   - **対処方法**:
     - proprietary ドライバーがインストールされている場合: `apt remove nvidia-driver-570 && apt install nvidia-driver-570-open`
     - P2PDMA が無効な場合: Ubuntu 24.04（カーネル 6.8 以降）にアップグレードします（デフォルト設定で P2PDMA が有効）
     - カーネルが 6.2 未満の場合: DMA-BUF を完全にサポートするためにカーネルを 6.2 以降にアップグレードします

----

### test-nccl

**目的**: 単一サーバーまたはマルチサーバー環境での分散トレーニングに向けて、NCCL 通信がエンドツーエンドで正常に動作するかを検証します。

**使用するタイミング**: すべての事前チェックが正常に完了した後の最終確認として実行します。実際のマルチ GPU 通信をテストします。

**確認内容**:
- NCCL の初期化およびプロセスグループの作成
- GPU 間通信（単一サーバーでは NVLink / PCIe、マルチサーバーでは RDMA）
- GPUDirect RDMA の利用状況（マルチサーバーの場合）
- all_reduce 集合演算の正確性

**ハードウェア依存関係**:
- 単一サーバー: 同一ホスト上に GPU が 2 台以上
- マルチサーバー: すべてのサーバーに RoCE 対応 Mellanox NIC があり、サーバー間のネットワーク接続が正しく構成されていること

#### 実行方法

1) 単一サーバー（GPU が 2 台以上必要）:

```bash
source /opt/pytorch-venv/bin/activate
torchrun --nproc_per_node=2 /usr/local/bin/test-nccl
```

**期待される出力**（単一サーバー、GPU 2 台、NCCL_DEBUG=INFO の場合）:

実際の出力には、初期化、トポロジー、チャネル、リングなどに関する多くの NCCL INFO ログが表示されます。以下は、その中で **確認すべき主な行** です。

```text
[NCCL] DMA-BUF is available
[NCCL] Using network IB:mlx5_0:1
[NCCL] NET/IB: Using addr=<SERVER_IP> port=48221 dev=mlx5_0
[NCCL] GDR 1
Rank 0: OK (result=1.0, expected=1.0)
Rank 1: OK (result=1.0, expected=1.0)
```

2) マルチサーバー（2 サーバー、それぞれ N GPU）:

```bash
# Server 0（マスター）:
source /opt/pytorch-venv/bin/activate
torchrun --nproc_per_node=<N> --nnodes=2 --node_rank=0 \
  --master_addr=<SERVER_0_IP> --master_port=29500 /usr/local/bin/test-nccl

# Server 1:
source /opt/pytorch-venv/bin/activate
torchrun --nproc_per_node=<N> --nnodes=2 --node_rank=1 \
  --master_addr=<SERVER_0_IP> --master_port=29500 /usr/local/bin/test-nccl
```

Where:

- `N` はテストに使用する各サーバーの GPU 数です
- `SERVER_0_IP` は Server 0 上の Mellanox NIC の IP アドレスで、このサーバーがコーディネーターとして動作します

**期待される出力**（マルチサーバー、2 サーバー × GPU 2 台、NCCL_DEBUG=INFO の場合）:

実際の出力には 50 行以上の NCCL INFO ログが含まれます。以下は **確認すべき主な指標** です。

```text
[NCCL] DMA-BUF is available
[NCCL] Using network IB:mlx5_0:1
[NCCL] NET/IB: Using addr=<SERVER_0_IP> port=48221 dev=mlx5_0
[NCCL] GDR 1
Rank 0: OK (result=6.0, expected=6.0)
Rank 1: OK (result=6.0, expected=6.0)
Rank 2: OK (result=6.0, expected=6.0)
Rank 3: OK (result=6.0, expected=6.0)
```

**結果の解釈**:

NCCL は、bootstrap、CUDA バージョン、通信設定、トポロジー、チャネル、リング、タイミングなどの詳細を出力します。これらの多くは無視して問題ありません。詳細出力の中では、次の **重要な指標** を確認してください。

- `DMA-BUF is available` - GPU メモリのエクスポートが正しく機能していることを示します
- `Using network IB` - RDMA / RoCE が使用されています（TCP へのフォールバックではない）
- `GDR 1` - GPUDirect RDMA が有効になっています（初期化時に GPU ごとに表示されます）
- `Rank N: OK (result=X, expected=X)` - all_reduce 演算が正常に完了しています

`Using network IB` ではなく `Using network Socket` が表示される場合、NCCL は TCP にフォールバックしています。この場合は `verify-rdma` を実行して RDMA の設定を確認してください。

#### トラブルシューティング

1. **NCCL テストが停止する、または失敗する**

   - **症状**: `test-nccl` の初期化中に処理が停止する、または NCCL エラーで失敗する。
   - **確認事項**:
     ```bash
     # NCCL 環境変数が設定されているか確認
     source /opt/pytorch-venv/bin/activate
     env | grep NCCL

     # 詳細なデバッグ出力で実行
     NCCL_DEBUG=TRACE torchrun --nproc_per_node=2 /usr/local/bin/test-nccl

     # マルチサーバーの場合、ネットワーク接続を確認
     ping <other-server-ip>

     # ファイアウォール設定を確認
     iptables -L -n
     ```
   - **対処方法**:
     - NCCL 環境変数が設定されていない場合: 実行前に `source /etc/profile.d/nccl-rdma.sh` を実行します
     - 初期化で停止する場合: ネットワーク接続やファイアウォール設定を確認します（NCCL は bootstrap 用に TCP ポートを使用します）
     - `"no NCCL devices found"` が表示される場合: `verify-gpudirect` を再実行して GPUDirect の設定を確認します
     - マルチサーバーで停止する場合: 両方のサーバーから `master_addr` の `master_port` に接続できることを確認します

2. **RDMA が使用されていない（TCP フォールバック）**

   - **症状**: NCCL のデバッグ出力に `Using network IB` ではなく `Using network Socket` が表示される。
   - **確認事項**:
     ```bash
     # RDMA デバイスが認識されているか確認
     ibv_devinfo

     # RDMA リンクがアクティブか確認
     rdma link show

     # NCCL が IB を無効化していないか確認
     echo $NCCL_IB_DISABLE
     # "0" または未設定である必要があります
     ```
   - **対処方法**:
     - RDMA デバイスが表示されない場合: `verify-rdma` を実行して RDMA スタックの問題を診断します
     - `NCCL_IB_DISABLE=1` の場合: 環境変数を unset するか、0 に設定します
     - RDMA デバイスが存在するのに NCCL が使用しない場合: `NCCL_DEBUG=INFO` を確認し、"IB device not usable" などのエラーがないか確認します

----

## RDMA と GPUDirect の詳細解説

### RDMA が必要になるケース

RDMA（Remote Direct Memory Access）は、**マルチサーバー分散トレーニングでは必須**ですが、単一サーバーのワークロードでは不要です。

**マルチサーバートレーニング**（RDMA が必要）:
- NCCL は、サーバー間の GPU 通信に GPUDirect RDMA を使用します
- 複数サーバーにまたがる分散トレーニング（DDP、FSDP、DeepSpeed）で必要です
- ネットワーク経路: GPU → NIC → network → NIC → GPU

**単一サーバートレーニング**（RDMA は使用されない）:
- NCCL は、サーバー内の GPU 間通信に GPUDirect P2P を使用します
- サーバー内 GPU 通信には NVLink（推奨）または PCIe を使用します
- 単一サーバートレーニングであれば、RDMA 検証を行わなくてもサーバーは問題なく動作します

**推論ワークロード**（RDMA は不要）:
- モデルサービング、推論、単一 GPU トレーニング

### RoCE 設定の詳細

RoCE（RDMA over Converged Ethernet）では、輻輳時のパケットドロップを防ぐためにロスレス Ethernet が必要です。これは、特定のトラフィッククラスに対して Priority Flow Control（PFC）を設定することで実現します。

**トラフィッククラスのマッピング**:
- ToS 104 = DSCP 26 = TC3（一般的な設定）
- DSCP 26 は AF31（Assured Forwarding 31）であり、高優先度データに対する標準的なマーキングです

**設定箇所**:
- RDMA-CM ToS: `/sys/kernel/config/rdma_cm/*/ports/1/default_roce_tos`（104 に設定）
- NCCL ToS: `/etc/profile.d/nccl-rdma.sh` 内の `NCCL_IB_TC=104`
- サービス: `rdma-cm-tos.service` が起動時に ToS を適用します

**確認方法**:

```bash
# rdma-cm-tos サービスの確認
systemctl status rdma-cm-tos

# RDMA-CM ToS 設定の確認
cat /sys/kernel/config/rdma_cm/mlx5_0/ports/1/default_roce_tos
# 出力: 104

# NCCL 設定の確認
grep NCCL_IB_TC /etc/profile.d/nccl-rdma.sh
# 出力: export NCCL_IB_TC=104

## FAQ

**PyTorch 環境を有効化するにはどうすればよいですか？**

```bash
source /opt/pytorch-venv/bin/activate
```

PyTorch を必要とする検証スクリプトでは、環境は自動的に有効化されます。ただし、インタラクティブに Python を使用する場合は、自分でこのコマンドを実行する必要があります。

**単一サーバーのトレーニングでは RDMA 検証を省略できますか？**

はい。RDMA 検証はマルチサーバーの分散トレーニングを想定しています。単一サーバーのワークロード（1 台のサーバー上でのマルチ GPU を含む）では、GPU の検証（`nvidia-smi` と PyTorch の CUDA チェック）のみで十分です。NCCL はサーバー内の GPU 通信に NVLink または PCIe を使用した GPUDirect P2P を利用します。

**verify-rdma と verify-gpudirect の違いは何ですか？**

- `verify-rdma`: RDMA ネットワークスタック（カーネルモジュール、RDMA デバイス、QoS 設定）を確認します。NIC 側の設定を検証します。
- `verify-gpudirect`: GPUDirect RDMA の設定（DMA-BUF サポート、nvidia-open ドライバー、GPU と NIC の連携）を確認します。GPU 側の設定を検証します。

GPUDirect RDMA を完全に検証するには両方が必要です。まず `verify-rdma` を実行し、その後 `verify-gpudirect` を実行してください。

**トレーニング中に RDMA が実際に使用されていることを確認するにはどうすればよいですか？**

NCCL のデバッグ出力（`NCCL_DEBUG=INFO` を設定）で次の指標を確認してください。

- `Using network IB:mlx5_0` - RDMA デバイスが使用されています
- `GDR 1` - GPUDirect RDMA が有効になっています

`Using network Socket` と表示される場合、NCCL は TCP にフォールバックしています。この場合は `verify-rdma` を実行して RDMA の設定を確認してください。

**ワークロード用に NCCL の環境変数を設定するにはどうすればよいですか？**

NCCL の環境変数は `/etc/profile.d/nccl-rdma.sh` に事前設定されており、ログインシェルでは自動的に読み込まれます。非インタラクティブなスクリプトやコンテナで使用する場合は、次のコマンドで明示的に読み込んでください。

```bash
source /etc/profile.d/nccl-rdma.sh
```

上書きする可能性のある主な NCCL 環境変数:

- `NCCL_DEBUG=INFO` - デバッグ出力を有効化（詳細なデバッグには `TRACE` を使用）
- `NCCL_NET_GDR_LEVEL=SYS` - GPUDirect RDMA の使用閾値（デフォルト: 常に使用）
- `NCCL_IB_TC=104` - RoCE 用トラフィッククラス（スイッチ設定と一致させる必要があります）
- `NCCL_IB_TIMEOUT=22` - ネットワークが遅い場合にタイムアウトエラーが出るときは値を増やします

