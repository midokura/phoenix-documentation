---
sidebar_position: 3
---

# オペレーターリファレンス

AI Factory のリファレンスシートです。AI Factory は、プライベートなマルチテナント型 AI ファクトリーを運用するためのエンドツーエンドソリューションです。  
本ページでは、オペレーター向けに必要な機材やインフラ要件の概要、およびシステムのプロビジョニングや設定手順への導入口を提供します。

インストーラーリンク、デプロイ用ファイル、その他必要なアセットはクライアントへ直接提供されます。support@midokura.com までお問い合わせください。

## システム要件

注記：ここで参照されているドキュメントは、環境セットアップセクションに含まれるダウンロード可能なアーティファクトとして提供されるものです。

- 作業を開始する前に、オペレーターは基盤となるインフラが以下のシステム要件を満たしていることを確認する必要があります。
- OpenStack コントロールノードの OS 要件については、[OS_REQUIREMENTS](./service-operator/OS_REQUIREMENTS.md) を参照してください。
- オペレーターは、ネットワーク構成、ポートおよびインターフェースの割り当てに関して、公式の [Blueprint](https://midokurajpeast.blob.core.windows.net/phoenix-releases/v1.8/phoenix-v1.2-blueprint.pdf?sp=r&st=2026-02-13T11:27:08Z&se=2050-02-13T19:42:08Z&spr=https&sv=2024-11-04&sr=b&sig=3vUMLFssAVFvqhIZeOkvDsmDXeLVY8FSSOGWXoBL7ns%3D) に従ってハードウェアをセットアップする必要があります。
  - OSt コントローラのベース OS は ubuntu-24.04 とします。
- ストレージ：オペレーターは、Blueprint に定義されたインフラ構成に統合された Ceph クラスタを用意する必要があります。詳細は [Environment setup](#environment-setup) を参照してください。
- IaaS サービスの SSO プロバイダーとして使用するため、新しい Google アプリケーションを設定します。手順については [GOOGLE_SSO_SETUP](./service-operator/GOOGLE_SSO_SETUP.md) を参照してください。
- ghcr.io/midokura のプライベートレジストリ用の認証情報を設定します。このトークンは安全な方法で提供され、コントロールプレーンのインストール時に必要となります。詳細は [GHCR_AUTHENTICATION](./service-operator/GHCR_AUTHENTICATION.md) を参照してください。

## 概要

以下のセクションでは、プロビジョニングプロセスを進めるために必要な各種資料への参照先を示します。このプロセスは、Blueprint に示されている Bastion ノードから実行されます。
全体として、本プロセスは Ansible のプレイブック群を用いて、コントロールプレーンのすべてのコンポーネントをインストールおよび設定する構成になっています。

## 環境セットアップ

Phoenix クラスタをインストールする際、オペレーターは Blueprint に示されている Bastion ノード上で作業を行います。`./phoenix` という新しいディレクトリを作成してください。
このディレクトリは、アーティファクトおよびプレイブックを格納するために使用されます。本ドキュメント内のすべてのコマンドおよびパスは、このディレクトリを基準としています。

## コントロールプレーンのインストール

- [CEPH_SETUP](./service-operator/CEPH_SETUP.md) に記載の手順に従い、Ceph クラスタを準備します。
- [Ansible プレイブック](https://midokurajpeast.blob.core.windows.net/phoenix-releases/v1.8/release-assets-0.0.0-1182-98fb456.zip?sp=r&st=2026-02-13T11:20:30Z&se=2050-02-13T19:35:30Z&spr=https&sv=2024-11-04&sr=b&sig=YUELOOSwWPidu8ceXhQN6G5qqziMM4BL9BKl5VoqJvA%3D) をダウンロードし、展開します。
- 同梱されている `inventory.example.yml` をベースに、クラスタ固有の設定を入力します。
- [DEPLOYMENT](./service-operator/DEPLOYMENT.md) の手順に従ってプレイブックを実行します。
- スイッチの設定については、[NETWORK_CONTROL_NODE_SETUP](./service-operator/NETWORK_CONTROL_NODE_SETUP.md) のステップ 4 以降の手順に従ってください。

## IaaS コンソール - テナントおよびユーザーの設定

追加の管理者ユーザーの作成、テナントおよびテナントユーザーの登録については、[IAAS_CONSOLE_CONFIGURATION](./service-operator/IAAS_CONSOLE_CONFIGURATION.md) の手順を参照してください。
