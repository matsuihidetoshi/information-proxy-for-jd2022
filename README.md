# Amazon Interactive Video Service (IVS) 視聴者数を取得して表示する機能をコマンド一発で構築する！

こんにちは！ [**株式会社スタートアップテクノロジー**](https://startup-technology.com/) テックリード、 [**AWS Serverless HERO**](https://aws.amazon.com/developer/community/heroes/hidetoshi-matsui/) の松井です！

今回は、以前 [**Amazon Interactive Video Service (IVS) と AWS Amplify を使って自分だけのオリジナル配信サイトを作る！**](https://aws.amazon.com/jp/builders-flash/202107/amplify-ivs-streaming-website) の記事でもご紹介したオリジナル配信サイトにも利用できる、 [**Amazon Interactive Video Service (IVS)**](https://aws.amazon.com/jp/ivs) の**配信視聴者数のリアルタイム取得と表示**ができる機能を、 [**AWS Cloud Development Kit (AWS CDK)**](https://aws.amazon.com/jp/cdk) を使って、 **コマンド一発** で構築する方法をご紹介します！

**Amazon IVS** を使うと、簡単に自分のオリジナル配信サイトを構築できますが、配信視聴者数などの付随した情報をリアルタイムにクライアント側に表示しようとすると、それなりにアーキテクチャの設計・構築が必要になり、少し大変です。  
今回ご紹介する方法を使うと、非常に簡単にそれが実現できます！

## アーキテクチャ

以前、 [**Amazon Interactive Video Service (IVS) と AWS Amplify を使って自分だけのオリジナル配信サイトを作る！**](https://aws.amazon.com/jp/builders-flash/202107/amplify-ivs-streaming-website) の記事でご紹介した部分も含めて、今回構築する配信サイトの視聴者数の取得、保存、表示する機能のアーキテクチャです。  
例として以前の記事の内容と併せてご紹介していますが、 **IVS** を使った配信サイトであれば今回の内容を流用することが可能です！

![ivs-viewers-count-cdk](https://user-images.githubusercontent.com/38583473/149286880-24e85caf-8899-4a4c-8cca-7703e292ec8f.png)

### 動作の流れ
1. [**Amazon EventBridge**](https://aws.amazon.com/jp/eventbridge/) で、 [**AWS Lambda**](https://aws.amazon.com/jp/lambda/) の関数を定期呼出します(毎分1回)。
2. 呼び出しされた **Lambda** 関数は、 **IVS** に取得者数を問い合わせします。
3. **Lambda** 関数が、取得した視聴者数を [**Amazon DynamoDB**](https://aws.amazon.com/jp/dynamodb/) に保存します。
    - 単純に視聴者数を取得・表示するだけならデータを永続化する必要はありませんが、下記の様な場合が考えられるので保存しておくと便利です。
      - 視聴者数データを別の用途に利用したい
      - 過去期間の視聴者数の増減に応じて、表示の仕方を変えたい(視聴者数が増加傾向なら盛り上がってることを表す表示をしたい、など)
4. **Lambda** 関数が、視聴者数を **Amazon DynamoDB** から過去の一定期間(5分)分も含めて取得します。
5. **Lambda** 関数が、 **DynamoDB** から取得した5分間の視聴者数を、 **IVS** に **Timed Metadata**\* として送信します。
6. 配信視聴クライアント(Web ブラウザ)側で、受け取った **Timed Metadata** を処理して、1分ごとの視聴者数をリアルタイムで表示します。

\* **Timed Metadata**: 任意の時間指定データをクライアント側に送信できる **IVS** の機能。

## 必要要件

- **AWS** の有効なアカウント
- 数十〜数百円程度の AWS 利用料
- 各種バージョン
  - **node.js**: v16.13.1
  - **npm**: 8.1.2
  - **CDK**: 2.3.0

## 手順

### 1. Cloud9 セットアップ

[**AWS Cloud9**](https://aws.amazon.com/jp/cloud9) を使えば、 Web ブラウザ経由で専用の開発環境を構築・利用できるので、誰でも簡単に同じスタートラインで開発を始められます。  
今回は **Cloud9** を使ってハンズオンを実施するので、下記の手順に沿ってまずは **Cloud9** 環境のセットアップをしましょう。

***

![スクリーンショット 2022-01-12 15 02 09](https://user-images.githubusercontent.com/38583473/149441839-87128991-a90a-4032-aa75-b62ff2c758a2.png)

- [**AWS マネジメントコンソール**](console.aws.amazon.com) から、検索フォームに `cloud9` と入力し、 **Cloud9** をクリックします。

***

- ディスクサイズ拡張
  - **Cloud9** のデフォルト設定では、 **CDK** に必要なディスクサイズが確保されていないので、 [**こちら**]https://docs.aws.amazon.com/ja_jp/cloud9/latest/user-guide/move-environment.html#move-environment-resize) で紹介されている方法でディスクサイズを拡張します。
