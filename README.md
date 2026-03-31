_The Japanese version follows below. 日本語版は以下に続きます。_ 

# Midokura AI Factory Documentation Website

These are the publicly available source files for the Midokura AI Factory Documentation [website](https://docs.midokura.com), which is build in [Docusaurus](https://docusaurus.io/).

## Installation

```bash
yarn
```

## Local Development

```bash
yarn run start
```

This command starts a local development server and opens up a browser window at: [http://localhost:3000/](http://localhost:3000/). Most changes are reflected live without having to restart the server.

Use Control + c to kill the localhost.

## Build

```bash
yarn run build
```

This command generates static content into the `build` directory. This `build` directory is not used to build the website, but this step is provided here in case you want to build a local copy.

## Add a Version

When you want to create a new version of the docs do:

```bash
yarn docusaurus docs:version v9.9
```

where `v9.9` should be replaced with the version you require.

This command will:

- Copy the full docs/ folder contents into a new `versioned_docs/version-v9.9/` folder.
- Create a versioned sidebars file `versioned_sidebars/version-v9.9-sidebars.json`.
- Add the new version number to `versions.json`.

Once you merge your changes to `main`, the website will rebuild with the new version available in the navigation bar dropdown.

## Add a Release Note

Each version of the docs requires a version release note, automatically generated based on this [release notes template](blog/.YYYY-MM-DD-aifactory-vX.X.md).

## Remove a Version

If we need to remove a no-longer-supported version of the docs from the website, remove the reference to the version in `versions.json`. Note that this doesn't delete the version source files, but just unpublishes them from the website.

## Deployment

- Any push to `main` results in a build to the website.

# Midokura AI Factory ドキュメントサイト

These are the publicly available source files for the Midokura AI Factory Documentation [website](https://docs.midokura.com), which is build in [Docusaurus](https://docusaurus.io/).
Midokura AI Factory ドキュメントサイト（[website](https://docs.midokura.com)）公開用ソースファイルです。  
本サイトは [Docusaurus](https://docusaurus.io/) を使用して構築されています。

## インストール

```bash
yarn
```

## ローカル開発

```bash
yarn run start
```

コマンドを実行すると、ローカル開発サーバーが起動し、ブラウザで [http://localhost:3000/](http://localhost:3000/)
 が自動的に開きます。
変更の大半はサーバーを再起動することなく即時に反映されます。

ローカルサーバーを停止するには、Control + C を押してください。

## ビルド

```bash
yarn run build
```

コマンドを実行すると、`build` ディレクトリに静的コンテンツが生成されます。
ローカルでビルド結果を確認したい場合に使用してください。`build` ディレクトリは本番サイトの構築には使用されません。

## バージョンの追加

新しいドキュメントバージョンを作成するには、以下を実行してください。

```bash
yarn docusaurus docs:version v9.9
```

`v9.9` の部分は、作成するバージョン番号に置き換えてください。

コマンドを実行すると、

- docs/ およびフォルダの内容が `versioned_docs/version-v9.9/` にコピーされます。
- バージョン用のサイドバーファイル `versioned_sidebars/version-v9.9-sidebars.json` が作成されます。
- `versions.json` に新しいバージョン番号が追加されます。

変更を main ブランチにマージすると、サイトが再ビルドされ、ナビゲーションバーのドロップダウンに新しいバージョンが表示されます。

## リリースノートの追加

各ドキュメントバージョンには、リリースノートが必要です。リリースノートは、[release notes template](blog/.YYYY-MM-DD-aifactory-vX.X.md) を基に作成されます。

## バージョンの削除

サポート対象外となったバージョンをサイトから削除する場合は、`versions.json` から該当バージョンの情報を削除してください。
この操作を行ってもソースファイル自体は削除されません。

## デプロイ

- `main` ブランチに変更を push すると、サイトが自動的にビルドされます。
