# Amazon Interactive Video Service (IVS) 視聴者数を取得して表示する機能をコマンド一発で構築する！

こんにちは！ [**株式会社スタートアップテクノロジー**](https://startup-technology.com/) テックリード、 [**AWS Serverless HERO**](https://aws.amazon.com/developer/community/heroes/hidetoshi-matsui/) の松井です！

今回は、以前 [**Amazon Interactive Video Service (IVS) と AWS Amplify を使って自分だけのオリジナル配信サイトを作る！**](https://aws.amazon.com/jp/builders-flash/202107/amplify-ivs-streaming-website) の記事でもご紹介したオリジナル配信サイトにも利用できる、 [**Amazon Interactive Video Service (IVS)**](https://aws.amazon.com/jp/ivs) の**配信視聴者数のリアルタイム取得と表示**ができる機能を、 [**AWS Cloud Development Kit (AWS CDK)**](https://aws.amazon.com/jp/cdk) を使って、 **コマンド一発** で構築する方法をご紹介します！

**Amazon IVS** を使うと、簡単に自分のオリジナル配信サイトを構築できますが、配信視聴者数などの付随した情報をリアルタイムにクライアント側に表示しようとすると、それなりにアーキテクチャの設計・構築が必要になり、少し大変です。今回ご紹介する方法を使うと、非常に簡単にそれが実現できます！

## 必要要件

- **AWS** の有効なアカウント
- 数十〜数百円程度の AWS 利用料
- 各種バージョン
  - **node.js**: v16.13.1
  - **npm**: 8.1.2
  - **cdk**: 2.3.0

## 手順

### 1. Cloud9 セットアップ

[**AWS Cloud9**](https://aws.amazon.com/jp/cloud9) を使えば、 Web ブラウザ経由で専用の開発環境を構築・利用できるので、誰でも簡単に同じスタートラインで開発を始められます。
今回は **Cloud9** を使ってハンズオンを実施するので、下記の手順に沿ってまずは **Cloud9** 環境のセットアップをしましょう。

***

![スクリーンショット 2022-01-12 15 02 09](https://user-images.githubusercontent.com/38583473/149281817-f29ba485-2b03-41b9-83fd-f1291c38b0cb.png)

- [**AWS マネジメントコンソール**](console.aws.amazon.com) から、検索フォームに `cloud9` と入力し、 **Cloud9** をクリックします。

***


- 
- ディスクサイズ拡張
  - **Cloud9** のデフォルト設定では、 **CDK** に必要なディスクサイズが確保されていないので、 [**こちら**]https://docs.aws.amazon.com/ja_jp/cloud9/latest/user-guide/move-environment.html#move-environment-resize) で紹介されている方法でディスクサイズを拡張します。
- 必要パッケージインストール
  - typescript
    ```
    npm -g install typescript
    ```
  - 
