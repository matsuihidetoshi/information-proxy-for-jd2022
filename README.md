# Amazon Interactive Video Service (IVS) 視聴者数を取得して表示する機能をコマンド一発で構築する！

こんにちは！ [**株式会社スタートアップテクノロジー**](https://startup-technology.com/) テックリード、 [**AWS Serverless HERO**](https://aws.amazon.com/developer/community/heroes/hidetoshi-matsui/) の松井です！

今回は、以前 [**Amazon Interactive Video Service (IVS) と AWS Amplify を使って自分だけのオリジナル配信サイトを作る！**](https://aws.amazon.com/jp/builders-flash/202107/amplify-ivs-streaming-website) の記事でもご紹介したオリジナル配信サイトにも利用できる、 [**Amazon Interactive Video Service (IVS)**](https://aws.amazon.com/jp/ivs) の**配信視聴者数のリアルタイム取得と表示**ができる機能を、 [**AWS Cloud Development Kit (AWS CDK)**](https://aws.amazon.com/jp/cdk) を使って、 **コマンド一発** で構築する方法をご紹介します！

**Amazon IVS** を使うと、簡単に自分のオリジナル配信サイトを構築できますが、配信視聴者数などの付随した情報をリアルタイムにクライアント側に表示しようとすると、それなりにアーキテクチャの設計・構築が必要になり、少し大変です。今回ご紹介する方法を使うと、非常に簡単にそれが実現できます！

## 必要要件

- **AWS** の有効なアカウント
- 数十〜数百円程度の AWS 利用料
- 各種バージョン
  - **node.js**: v16.13.2
  - **npm**: 8.1.2
  - **cdk**: 2.3.0

## 手順

### ①Cloud9 セットアップ
- 必要パッケージインストール
  - typescript
    ```
    npm -g install typescript
    ```
  - 
