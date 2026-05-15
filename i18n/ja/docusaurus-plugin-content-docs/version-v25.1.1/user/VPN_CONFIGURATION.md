# テナントユーザーとしての VPN 設定

テナントユーザーとしての VPN 設定手順。

本ガイドでは、テナントに割り当てられたユーザーが VPN アクセスを設定する方法について説明します。

WireGuard のセットアップおよび設定方法については、[WireGuard Quick Start guide](https://www.wireguard.com/quickstart/) を参照してください。

## 概要

ユーザーがテナントに追加されると、オペレーターはそのユーザー向けの VPN 設定スクリプトを生成できます。  
ユーザーは、このスクリプトと自身のプライベートキーを組み合わせて、完全な VPN 設定を作成します。

本ページではユーザー側の手順を説明します。オペレーター側の手順については、[こちら](i18n/ja/docusaurus-plugin-content-docs/current/service-operator/VPN_CONFIGURATION.md) を参照してください。

## セットアップ手順

VPN のセットアップは、以下の手順で行います。

1. ユーザーが WireGuard の鍵ペアを生成します  
2. ユーザーが公開鍵をオペレーターに共有します  
3. ユーザーは設定スクリプトを受け取り、プライベートキーと組み合わせて最終的な VPN 設定を作成します

## 鍵ペアの生成

まず、WireGuard のプライベートキーと公開鍵を生成します。

```bash
wg genkey > privatekey && wg pubkey < privatekey > pubkey
```

このコマンドにより、以下の 2 つのファイルが作成されます。

- `privatekey`：機密情報として安全に保管してください
- `pubkey`：オペレーターに共有します

公開鍵を確認するには、以下のコマンドを実行します。

```bash
cat pubkey
```

## 公開鍵をオペレーターに共有

生成した公開鍵をオペレーターに提供し、テナントへの追加を依頼します。

## VPN 設定の生成

サービスオペレーターからスクリプトを受け取ったら、以下の手順を実行します。

### Step 1：スクリプトとプライベートキーの結合

オペレーターから受け取った設定スクリプトを実行し、プライベートキーを組み込みます。

```bash
cat privatekey | bash vpn-config-script.sh > wg.conf
```

この操作により、完全な VPN 設定が記述された `wg.conf` が生成されます。

### Step 2：設定のインポート

WireGuard の UI または CLI を使用して、生成した設定をシステムにインポートします。CLI の例は以下のとおりです。

```bash
sudo wg-quick up ./wg.conf
```
