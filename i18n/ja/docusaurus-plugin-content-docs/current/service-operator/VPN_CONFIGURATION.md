---
sidebar_position: 90
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# VPN構成 (サービスオペレーター向け)

サービスオペレーターとしてVPNを設定します。

本ガイドでは、テナントに割り当てられたユーザーのVPNアクセスを
サービスオペレーターが設定する方法を説明します。

WireGuardの設定方法一般に関しては
[WireGuard Quick Start guide](https://www.wireguard.com/quickstart/)
を参照してください。

## 概要

オペレーターは、ユーザーをテナントに追加する際、そのユーザーのための
VPN構成スクリプトを生成できます。
ユーザーは、そのスクリプトと自分の秘密鍵を組み合わせて完全なVPN構成を
生成します。
本ページでは、サービスオペレーター側の手順を説明します。
ユーザー側の手順は[ここ](/docs/user/VPN_CONFIGURATION)を参照してください。

## 設定手順

まず、ユーザーがWireGuardの鍵ペアを作成し、公開鍵をサービスオペレーターに
共有します。
その後のVPN設定の手順は以下のようになります。:

1. オペレーターはユーザーと共有鍵をテナントに追加します
2. オペレーターはVPN構成スクリプトを取得して、ユーザーに提供します

## テナントへのユーザーの追加

ユーザーの共有鍵を受け取った後、そのユーザーをテナントに追加します。
その際、ユーザーのWireGuard共有鍵をVPNアクセス構成の`pubkey`フィールドに
与えなければいけません。

完全なAPIの詳細と例は、the Operator API Guideの
[Add User to Tenant](OPERATOR_API_GUIDE.md#add-user-to-tenant)
節を参照してください。

## VPN構成スクリプトの取得と提供

該当ユーザーのためのVPN構成スクリプトを以下のようにして取得します。:

```bash
curl -H "Authorization: Bearer $JWT_TOKEN" \
     -H "Content-Type: application/json" \
     "${API_BASE_URL}/users/${USER_ID}/vpn" > vpn-config-script.sh
```

取得したスクリプトをユーザーに提供します。

## VPN Configuration Reference

上で取得した構成スクリプトは、以下のような書式の
WireGuard構成ファイルを出力します。
ユーザー固有の値は、スクリプトが自動的に挿入します。
ここに示した値は説明のためのものです。

```ini
[Interface]
# ユーザーの秘密鍵。ユーザー自身が生成したもので、
# オペレーターに共有されることはありません。
PrivateKey = <user private key>
# ユーザーのVPNのIPアドレス。APIによってユーザー毎に割り当てられます。
Address = 172.31.42.42/32
# VPNのDNSサーバー。テナント内の全てのユーザーに共有されます。
# 検索ドメインが続く事もあります。(これはmacOSのApp Storeクライアント
# ではサポートされません。トラブルシューティング節を参照してください。)
DNS = 172.31.0.254, tld
# オプション: ユーザーのネットワークのMTUが1500バイト未満の場合は
# 設定してください。(例. IPv4 over IPv6)
MTU = 1312

[Peer]
# VPNサーバーの公開鍵。テナント内の全てのユーザーで同一です。
PublicKey = ExampleServerPublicKey+/+/+/+/+/+/+/+/+/+/+=
# これらのIP範囲へのトラフィックは、VPN経由となるようルーティングされます。
AllowedIPs = 10.8.42.0/24, 172.31.42.0/24
# VPNサーバーのアドレスとポート番号
Endpoint = vpn.example.com:4242
# オプション: NAT越しの接続を維持するたものキープアライブパケットを
# 送信する間隔。(秒)
PersistentKeepAlive = 25
```

## トラブルシューティング

もしユーザーからVPN接続の問題について報告があったときは、
以下のフローチャートを使って可能性の高い原因を見付け、
参照先の節にある詳細な手順に従ってください。

```mermaid
flowchart TD
    Start([VPN接続の問題]) --> NetCheck{"インターネットに到達可能?\nping midokura.com"}
    NetCheck -- いいえ --> NetFail["VPNのトラブルシューティングの前に、\nインターネット接続の問題を修正してください。"]
    NetCheck -- はい --> WGCheck{"WireGuardの状態:\nlatest handshakeが表示されていて、受信バイト数が0より多い?\n参照: Step 2"}
    WGCheck -- "handshakeの表示がない、または\n受信バイト数が0" --> KeyFail["鍵の不一致\nユーザーの公開鍵が正しく登録されているか確認\n参照: Step 2"]
    WGCheck -- はい --> DNSPing{"DNSエンドポイントに対するping\n172.31.0.254\n参照: Step 2"}
    DNSPing -- 応答なし --> Routes["AllowedIPs範囲の確認\n参照: Allowed Routesの確認"]
    Routes --> MTU["MTU設定の確認\nMTUトラブルシューティングへ"]
    DNSPing -- 応答あり --> DNSCheck{"DNS解決はOK?\nnslookupテスト\n参照: DNSのテスト"}
    DNSCheck -- 失敗 --> DNSConfig["WireGuardファイルのDNS設定を確認"]
    DNSConfig --> MacOSNote["macOS App Storeクライアント:\n/etc/resolverの設定\n参照: macOS WireGuardクライアント"]
    DNSConfig --> DoH["ブラウザーがVPN DNSを迂回している?\nDoHを無効にする\n参照: ブラウザーのDNS-over-HTTPS"]
    DNSCheck -- 動作する --> Done([VPNは正常に動作しています])
```

### 接続性の確認

WireGuardには、無効なパケットは無視されるという特徴があります。
つまり、接続のどちら側も、無効な鍵について警告する事はありません。
エラーが無い事は接続の成功を意味しません: 段階的なトラブルシューティングが必要です。

#### Step 1: サーバー到達性の確認

ネットワーク接続性を確認するため、WireGuardのエンドポイントにpingします。:

```bash
# まず、インターネットへの接続を確認します。
ping midokura.com
# 次に、VPNサーバーにpingしてみます。
ping vpn.example.com
```

:::note

VPNサーバーはpingに応答しないよう意図的に設定されているかもしれません。

:::

#### Step 2: VPN接続の確認

WireGuard接続を有効にした後:

##### wg統計情報の確認

<Tabs groupId="os">
<TabItem value="linux" label="Linux">

WireGuardクライアントの状態をローカルで確認:

`$ sudo wg`

接続に成功している場合の出力例:

```bash
interface: wg-tenant
  public key: ExampleUserPublicKey+/+/+/+/+/+/+/+/+/+/+/+=
  private key: (hidden)
  listening port: 49913

peer: ExampleServerPublicKey+/+/+/+/+/+/+/+/+/+=
  endpoint: 203.0.113.42:4242
  allowed ips: 10.8.42.0/24, 172.31.42.0/24
  latest handshake: 1 minute, 30 seconds ago
  transfer: 24.92 KiB received, 24.55 KiB sent
  persistent keepalive: every 25 seconds
```

クライアントの鍵、またはサーバーの鍵が間違っている場合の出力例:

```bash
interface: wg-tenant
  public key: ThisIsAnExampleOfIncorrectClientPublicKey+/=
  private key: (hidden)
  listening port: 45986

peer: ExampleServerPublicKey+/+/+/+/+/+/+/+/+/+=
  endpoint: 203.0.113.42:4242
  allowed ips: 10.8.42.0/24, 172.31.42.0/24
  transfer: 0 B received, 444 B sent
  persistent keepalive: every 25 seconds
```

:::note

この場合:
- いくらかのデーターが送信されました (しかし、サーバーがそれを正しく受信したかはわかりません)
- 0バイトのデーターが受信されました: サーバーの正当性を確認できずサーバーからのデーターを無視したのか、
  サーバーがクライアントの正当性を確認できず応答しなかったのか
- "latest handshake"のタイムスタンプはありません

:::

</TabItem>
<TabItem value="macos" label="macOS">

[Mac App StoreにあるWireGuardアプリ](https://apps.apple.com/us/app/wireguard/id1451685025?mt=12)には、
`wg`コマンドラインツールは同梱されていませんので、`sudo wg`を使う事はできません。

トンネルの状態を確認するには、macOSメニューバーにある**Manage Tunnels**を開いてください。
last handshakeタイムスタンプ、設定された各トンネルの転送の統計情報を含む接続の状態を確認できます。

動作中の接続については、受信バイト数が表示されます。
もし受信バイト数が0のままであったり、handshakeが表示されていなければ、おそらく鍵の設定が間違っています。
その場合、ユーザーの公開鍵が正しく登録されているか確認してください。

</TabItem>
</Tabs>

##### DNSエンドポイントへのping

DNSエンドポイントのIPアドレスに対してpingして、トラフィックがVPNを経由してサーバーに到達可能か確認します。:

```bash
ping 172.31.0.254
```

pingの成功はWireGuard接続が正しく動作している事を示しています。

### DNSのテスト

VPN経由での資源アクセスにDNS解決は重要です。
以下のように段階的にトラブルシューティングできます:

```bash
# 構成にあるVPNサーバー経由での、公開ドメイン名の解決のテスト
nslookup midokura.com 172.31.0.254

# WireGuard DNS設定に存在する場合、"tld"サブドメインを解決できる事を確認
nslookup myvm.tenant.example.tld 172.31.0.254

# ".tld" DNSクエリーがデフォルトでVPNに送信される事を確認
nslookup myvm.tenant.example.tld

# IA Factory ConsoleのURLが解決できる事を確認
nslookup console.aifactory.example.tld 172.31.0.254

# 接続時、DNSリゾルバーが正しく設定されている事を確認
nslookup console.aifactory.example.com
```

どのコマンドも有効なIPアドレスを返します。
もしDNS解決が失敗したら、WireGuard設定に指定されているDNSサーバーが正しく、到達可能であることを確認してください。

:::note macOS App Storeクライアント: サーチドメインはサポートされていません

App Storeクライアンは`DNS`フィールドのサーチドメイン接尾詞(例. `DNS = 172.31.0.254, tld`)をサポートしていません。
サーチドメイン無しのDNSサーバーアドレスをかわりに使ってください:

```ini
DNS = 172.31.0.254
```

この設定は、サーチドメインにマッチしたDNSクエリーだけでなく、全てのDNSクエリーをVPN経由で行うようにします。

または、`resolver(5)`システムリゾルバーを使用して、サーチドメインを設定する事もできます:

```ini
# /etc/resolver/ai-factory.tld
domain tld
search tld
nameserver 172.31.0.254
```

詳細は、macOSの`resolver(5)`マニュアルページを参照してください。

:::

### 上級VPNトラブルシューティング

いくつかのトラブルシューティング手段は(OSやブラウザー、インターネット接続などの)環境に特有です。
または、通常必要ありません。

#### Allowed Routesの確認

VPN経由でアクセスされる資源は、WireGuard設定の`AllowedIPs`の範囲に含まれている必要があります。
例えば、ユーザーが`10.0.0.5`上のサービスにアクセスする必要がある場合、`AllowedIPs`は、そのIPを含む、
`10.0.0.0/8`や、より具体的な範囲を含む必要があります。

全ての必要なネットワークが含まれるよう、`AllowedIPs`設定を見直してください。

```ini
AllowedIPs = 10.8.42.0/24, 172.31.0.0/24
```

典型的に、これは少なくとも二つのネットワークを含みます:

- テナントVPNのアドレス範囲。この設定例では、クライアントのアドレスは`172.31.42.42/32`で、範囲は`172.31.42.0/24`です。
- テナントネットワーク資源のアドレス範囲。この設定例では、ネットワークは`10.8.42.0/24`です。

資源への接続に問題があるときは、資源のアドレスについて考えてください:
- それはVPNネットワーク上で利用可能ですか?
- そのネットワークはVPN設定に含まれていますか?
- (VPN以外の)ローカルネットワークとVPNアドレスの間に衝突はありますか?

#### MTUトラブルシューティング

MTU(最大送信単位)問題によって、パケットが無言で落とされる事があります。
例えば、IPv4 over IPv6接続では、MTUが標準の1500バイトより小さいかもしれません。
この設定は常に必要というわけではありません。ローカルのネットワークゲートウェイがMTUについて知っているかによります。

接続のMTUをテストしてください:

<Tabs groupId="os">
<TabItem value="linux" label="Linux">

```bash
ping -4 -M do -s 1472 example.com
```

:::note

IPv4ヘッダーが20バイト、ICMPヘッダーが8バイトをパケット長に加えられます。
よって、ちょうど1500バイトのパケットの送信をテストするには、ペイロード長1472を使用する必要があります。

:::

もしこれが失敗したら、動作する最大長を見付けるために、より小さいパケット長、例えば1400や1300を試してみてください。
VPN設定中のMTUの値があなたのネットワークに適切であるようにしてください。

出力例:

```bash
ping -4 -M do -s 1352 midokura.com
PING midokura.com (198.51.100.42) 1472(1500) bytes of data.
From _gateway (192.168.1.1) icmp_seq=1 Frag needed and DF set (mtu = 1380)
ping: sendmsg: Message too long
^C
ping -M do -s 1352 midokura.com
PING midokura.com (198.51.100.42) 1352(1380) bytes of data.
1360 bytes from 42-100.midokura.com (198.51.100.42): icmp_seq=1 ttl=47 time=12 ms
^C
```

:::note

この例では、ルーターはMTUについて知っており、このパケット長に対処できます。
このルーターは、「MTUは1380であり、このパケットをフラグメント化せずに送信する事はできません」
という内容のメッセージを返しています。

この例の場合、クライアントでのMTU設定は必要ありませんが、
pingによる探索でのパケット長1472失敗、パケット長1352成功は、1380 ≦ MTU < 1500である事を示しています。

:::

</TabItem>
<TabItem value="macos" label="macOS">

macOSでMTUをテストするには、以下のコマンドを使用してください:

```sh
ping -D -s 1472 midokura.com
```

もしこれが失敗したら、動作する最大長を見付けるために、より小さいパケット長、例えば1400や1300を試してみてください。
VPN設定中のMTUの値があなたのネットワークに適切であるようにしてください。

</TabItem>
</Tabs>

#### UbuntuとNetworkManager

Ubuntuは、WireGuard VPNを含むネットワーク接続を管理するためにNetworkManagerを使用します。
NetworkManagerは`wg`上にヘルパーを提供するため、本ガイドのトラブルシューティング手順は依然適用できます。
しかし、設定変更後に接続の問題を経験した時は、VPN接続の再起動やDNSキャッシュのフラッシュが効果的な事があります。

**VPN接続の再起動:**

```bash
sudo nmcli connection down <vpn-connection-name>
sudo nmcli connection up <vpn-connection-name>
```

**DNSキャッシュのフラッシュ:**

```bash
sudo resolvectl flush-caches
```

### ブラウザーのDNS-over-HTTPS (DoH)

"DNS over HTTPS" (DoH)機能がVPNのDNS設定を迂回して、VPN経由でしかアクセスできない資源の名前解決を妨げる事があります。

#### Firefox

FirefoxでシステムDNSリゾルバーの使用を許可するには、以下のようにします:

1. [Firefoxのprivacy preferencesページ](about:preferences#privacy)を開きます
2. **DNS over HTTPS**までスクロールします
3. **Default Protection**または**Increased Protection**を選択してシステムDNSの使用を許可するか、
   **Off**を選択してDoHを無効にします

#### Chrome

ChromeでDoHを無効にするには、以下のようにします:

1. [Chromeの設定ページ](chrome://settings/security)を開きます
2. **Use secure DNS**までスクロールします
3. トグルをオフにするか、**With your current service provider**を選択します
