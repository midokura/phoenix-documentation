# クラスターアドオン

クラスターアドオンを使用して、Kubernetes クラスター上でツールをインストール・管理します。

クラスターアドオンを使用すると、JupyterHubやKubeRayなどの一般的なツールを、IaaS ConsoleのUIから数クリックでKubernetesクラスターにインストール・管理できます。

## はじめに

Kubernetes上で複雑なソフトウェアを管理するには、通常、Helmチャートや技術的な設定を行う必要があります。クラスターアドオンでは、事前構成済みのツールをカタログから選択し、数クリックでインストールできます。

## アドオンのインストール

クラスターにアドオンをインストールする手順は次のとおりです。

1. IaaS Console の **Clusters** セクションに移動します。
2. アドオンをインストールするクラスターを選択します。
3. **Add-ons** タブを開きます。
4. **Install Add-on** をクリックし、カタログからツール（例: JupyterHub）を選択します。
5. 必要に応じて、**オプションパラメーター**（CPUやMemoryの上限など）を設定します。
6. インストールを確定します。

必要なリソースのプロビジョニング中、初期ステータスは `pending-install` と表示されます。

## ステータスの監視

インストールを開始すると、Add-onsタブで進行状況を確認できます。

- **Pending Install**：ソフトウェアをデプロイ中です。通常 2〜5 分かかります。
- **Deployed**：アドオンの準備が整いました。インターフェイス上にアクセス URL（例: JupyterHub Web UI 用）が表示されます。
- **Failed**：インストール中にエラーが発生しました。ステータスをクリックすると、エラーメッセージの詳細を確認できます。

## アドオンのアンインストール

アドオンを削除する手順は次のとおりです。

1.  **Add-ons** タブで、削除するアドオンインスタンスを確認します。
2. 削除（ゴミ箱）アイコンをクリックします。
3. 削除を確定します。

アドオンをアンインストールすると、アドオン専用のネームスペースにあるすべての関連データとリソースが削除されます。

## Model Provider

**Model Provider** アドオンでは、vLLMを使用してオープンソースの言語モデルをクラスターにデプロイできます。また、OpenAI互換の推論APIを利用できます。

### 利用可能なモデル

| モデル名 | 表示名 | 推奨用途 |
|---|---|---|
| `qwen3.5-35b` | Qwen3.5 35B A3B GPTQ Int4 | 汎用的なテキスト生成、ツール呼び出し、推論タスク。 |
| `kimi-vl-a3b` | Kimi VL A3B Instruct | テキストと画像を組み合わせたマルチモーダルタスク（視覚言語）。プロンプトに画像や視覚情報が含まれる場合に使用します。 |
| `qwen3.5-4b-guardrail` | Qwen3.5 4B AWQ 4bit | 軽量なガードレールやコンテンツ分類タスク。高速かつ少ないリソースで実行できる推論向けの小規模モデルです。 |

### Model Provider のインストール

Add-onsタブからインストールする場合は、カタログからモデルを1つ以上選択します。1つのアドオンインスタンスに複数のモデルを同時にデプロイできます。

API 経由でインストールする場合：

```bash
export CLUSTER_ID="<your-cluster-id>"

curl -X POST \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"addon": "model-provider", "params": {"models": ["qwen3.5-35b"]}}' \
  "${API_BASE_URL}/clusters/${CLUSTER_ID}/addons"
```

### 推論エンドポイントの利用

アドオンのステータスが `deployed` になったら、インストール時のレスポンスに含まれるインスタンス名（例：`model-provider-x7k2`）を使用して、推論エンドポイントのURLを取得します。

```bash
export ADDON_NAME="model-provider-x7k2"
curl -H "Authorization: Bearer $JWT_TOKEN" \
  "${API_BASE_URL}/clusters/${CLUSTER_ID}/addons/${ADDON_NAME}"
```

レスポンスの `info.inference` フィールドにベースURLが含まれます。

```bash
export INFERENCE_URL="http://<info.inference の値>"
```

**テキスト生成（chat completions）**:

```bash
curl -X POST "${INFERENCE_URL}/v1/chat/completions" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen3.5-35b",
    "messages": [
      {"role": "user", "content": "Explain Kubernetes resource limits in one paragraph."}
    ]
  }'
```

**画像入力（Kimi VL）**:

```bash
curl -X POST "${INFERENCE_URL}/v1/chat/completions" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "kimi-vl-a3b",
    "messages": [
      {
        "role": "user",
        "content": [
          {"type": "text", "text": "What is in this image?"},
          {"type": "image_url", "image_url": {"url": "https://example.com/image.png"}}
        ]
      }
    ]
  }'
```

**エンドポイントで利用可能なモデルの一覧表示**:

```bash
curl "${INFERENCE_URL}/v1/models"
```

### ストレージとデータの保持

各モデルのモデルウェイトは、それぞれ専用のReadWriteOnce PVCに保存されます。アドオンをアンインストールすると、これらのPVCも削除され、ダウンロード済みのモデルデータはすべて消去されます。再インストールすると、モデルウェイトが再度ダウンロードされます。

## トラブルシューティング

### インストール失敗時

アドオンのインストールに失敗した場合（ステータス：`failed`）：

1. エラーメッセージをUIで確認します。起動に失敗したリソースの詳細が表示されます。
2. クラスターのリソースを確認します。アドオンの実行に必要なCPU、GPU、RAMがクラスターに残っていることを確認します。
3. 再インストールします。一時的なネットワーク障害が原因で失敗する場合があります。失敗したインスタンスを削除し、再度インストールしてください。

### 上級：Flux のログの確認

`kubectl` でクラスターにアクセスできる場合は、ログを確認してリリースが停止している原因を調査できます。

```bash
# すべての Helm release のステータスを確認
kubectl get helmrelease -A

# Flux helm-controller のログを表示
kubectl logs -n flux-system deployment/helm-controller
```

### UI へのアクセス

アドオンが `deployed` 状態にもかかわらず、表示されたURLに接続できない場合：

1. クラスターのネットワークでVPN接続が必要な場合は、VPNに接続していることを確認します。
2. クラスターのセキュリティグループで、指定されたポートのトラフィックが許可されていることを確認します。
