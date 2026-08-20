# クラスターアドオン

クラスターアドオンを使用して、Kubernetes クラスター上でツールをインストール・管理します。

クラスターアドオンを利用すると、JupyterHub や KubeRay といった一般的なツールを、IaaS Console の UI から数クリックで Kubernetes クラスターに簡単にインストール・管理できます。

## はじめに

Kubernetes 上で複雑なソフトウェアを管理するには、通常 Helm チャートや技術的な設定の取り扱いが必要となります。クラスターアドオン機能では、事前構成済みのツールをキュレーションされたカタログとして提供することで、こうした作業を簡略化し、数クリックでインストールできます。

## アドオンのインストール

クラスターにアドオンをインストールする手順は次のとおりです。

1. IaaS Console の **Clusters セクションに移動** します。
2. アドオンをインストールしたい **クラスターを選択** します。
3. **Add-ons タブを開きます**。
4. **「Install Add-on」をクリック** し、カタログからツール（例: JupyterHub）を選択します。
5. 利用可能な場合は **オプションパラメータ（CPU や Memory の上限など）を設定** します。
6. **インストールを確定** します。

ステータスは、必要なリソースがプロビジョニングされる間、最初は `pending-install` と表示されます。

## ステータスの監視

インストール開始後、進行状況は Add-ons タブで追跡できます。

- **Pending Install**: システムがソフトウェアをデプロイ中です。通常 2〜5 分かかります。
- **Deployed**: アドオンの準備が完了しました。インターフェイス上にアクセス URL（例: JupyterHub Web UI 用）が表示されます。
- **Failed**: インストール中にエラーが発生しました。ステータスをクリックすると詳細なエラーメッセージを確認できます。

## アドオンのアンインストール

アドオンを削除する手順は次のとおりです。

1. **Add-ons タブ** でアドオンインスタンスを探します。
2. **削除（ゴミ箱）アイコン** をクリックします。
3. 削除を確定します。

アドオンをアンインストールすると、そのアドオン専用のネームスペース内にある関連データとリソースはすべて削除されます。

## Model Provider

**Model Provider** アドオンは、vLLM を使用してオープンソースの言語モデルをクラスターにデプロイし、OpenAI 互換の推論 API を公開します。

### 利用可能なモデル

| モデル名 | 表示名 | 推奨用途 |
|---|---|---|
| `qwen3.5-35b` | Qwen3.5 35B A3B GPTQ Int4 | 汎用テキスト生成、ツール呼び出し、推論タスク。 |
| `kimi-vl-a3b` | Kimi VL A3B Instruct | テキストと画像を組み合わせたマルチモーダルタスク（視覚言語）。プロンプトに画像や視覚的コンテキストが含まれる場合に使用します。 |
| `qwen3.5-4b-guardrail` | Qwen3.5 4B AWQ 4bit | 軽量なガードレールやコンテンツ分類タスク。小規模モデルで十分な、高速・低リソースの推論向けに設計されています。 |

### Model Provider のインストール

Add-ons タブからインストールする際、カタログから 1 つ以上のモデルを選択します。同一のアドオンインスタンス上に複数のモデルを同時にデプロイできます。

API 経由でインストールする場合:

```bash
export CLUSTER_ID="<your-cluster-id>"

curl -X POST \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"addon": "model-provider", "params": {"models": ["qwen3.5-35b"]}}' \
  "${API_BASE_URL}/clusters/${CLUSTER_ID}/addons"
```

### 推論エンドポイントの利用

アドオンのステータスが `deployed` になったら、インストール応答に含まれるインスタンス名（例: `model-provider-x7k2`）を用いて推論エンドポイント URL を取得します。

```bash
export ADDON_NAME="model-provider-x7k2"
curl -H "Authorization: Bearer $JWT_TOKEN" \
  "${API_BASE_URL}/clusters/${CLUSTER_ID}/addons/${ADDON_NAME}"
```

応答の `info.inference` フィールドにベース URL が含まれます。

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

各モデルはモデルウェイトを保存するために専用の ReadWriteOnce PVC を使用します。**アドオンをアンインストールするとこれらの PVC は削除される** ため、ダウンロード済みのモデルデータはすべて消去されます。再インストールすると、モデルウェイトは再度ダウンロードされます。

## トラブルシューティング

### インストール失敗時

アドオンのインストールが失敗（ステータス: `failed`）した場合:

1. UI 上で **エラーメッセージを確認** します。多くの場合、どのリソースの起動に失敗したかが詳細に表示されます。
2. **クラスターのリソースを確認**: アドオンを稼働させるのに十分な CPU, GPU, RAM がクラスターに残っているか確認します。
3. **再インストール**: 一時的なネットワーク障害で失敗する場合もあります。失敗したインスタンスを削除し、再度インストールを試みてください。

### 上級: Flux のログの確認

クラスターに `kubectl` でアクセスできる場合、ログを確認してリリースが停止している原因を調べられます。

```bash
# すべての Helm release のステータスを確認
kubectl get helmrelease -A

# Flux helm-controller のログを表示
kubectl logs -n flux-system deployment/helm-controller
```

### UI へのアクセス

アドオンが `deployed` 状態にも関わらず、提供された URL に接続できない場合:

1. VPN 接続がアクティブであることを確認します（クラスターのネットワークで必要な場合）。
2. クラスターのセキュリティグループが指定されたポートでのトラフィックを許可しているか確認します。
