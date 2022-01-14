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

#### **Cloud9** 環境作成

***

![スクリーンショット 2022-01-12 15 02 09](https://user-images.githubusercontent.com/38583473/149441839-87128991-a90a-4032-aa75-b62ff2c758a2.png)

- [**AWS マネジメントコンソール**](console.aws.amazon.com) から、検索フォームに `cloud9` と入力し、 **Cloud9** をクリックします。

***

![スクリーンショット 2022-01-12 15 02 23](https://user-images.githubusercontent.com/38583473/149443248-141dde0d-f164-4256-a2ca-fb3bb84fdcd2.png)

- **Create environment** をクリックします。

***

![スクリーンショット 2022-01-12 15 02 47](https://user-images.githubusercontent.com/38583473/149443453-28a49f10-bd95-4ff2-a096-6f3432a07d29.png)

- **Name** に任意の環境名(今回は `ivs-cdk-environment` としています)を入力し、 **Next step** をクリックします。

***

![スクリーンショット 2022-01-12 15 03 41](https://user-images.githubusercontent.com/38583473/149443740-508d790b-15fb-44d7-a2e4-e348bf888070.png)

- **Instance type** は **t3.small** を選択し、それ以外はデフォルトのまま **Next step** をクリックします。

***

![スクリーンショット 2022-01-12 15 03 52](https://user-images.githubusercontent.com/38583473/149457678-983fd82d-cfe1-428f-89a9-341828e64ff9.png)

- **Create environment** をクリックします。

***

#### ディスクサイズ拡張

**Cloud9** のデフォルト設定では、 **CDK** の実行に必要なディスクサイズが確保されていないので、 [**こちら**](https://docs.aws.amazon.com/ja_jp/cloud9/latest/user-guide/move-environment.html#move-environment-resize) で紹介されている方法でディスクサイズを拡張します。

***

![スクリーンショット 2022-01-12 15 07 55](https://user-images.githubusercontent.com/38583473/149458029-757427e9-7d7e-417c-9e0f-302d7235bcf2.png)

- ディスクサイズ拡張用スクリプト、 **resize.sh** を作成します。

***

- 作成した **resize.sh** に、下記を記述して保存します。

    ```bash
    #!/bin/bash

    # Specify the desired volume size in GiB as a command line argument. If not specified, default to 20 GiB.
    SIZE=${1:-20}

    # Get the ID of the environment host Amazon EC2 instance.
    INSTANCEID=$(curl http://169.254.169.254/latest/meta-data/instance-id)
    REGION=$(curl -s http://169.254.169.254/latest/meta-data/placement/availability-zone | sed 's/\(.*\)[a-z]/\1/')

    # Get the ID of the Amazon EBS volume associated with the instance.
    VOLUMEID=$(aws ec2 describe-instances \
      --instance-id $INSTANCEID \
      --query "Reservations[0].Instances[0].BlockDeviceMappings[0].Ebs.VolumeId" \
      --output text \
      --region $REGION)

    # Resize the EBS volume.
    aws ec2 modify-volume --volume-id $VOLUMEID --size $SIZE

    # Wait for the resize to finish.
    while [ \
      "$(aws ec2 describe-volumes-modifications \
        --volume-id $VOLUMEID \
        --filters Name=modification-state,Values="optimizing","completed" \
        --query "length(VolumesModifications)"\
        --output text)" != "1" ]; do
    sleep 1
    done

    #Check if we're on an NVMe filesystem
    if [[ -e "/dev/xvda" && $(readlink -f /dev/xvda) = "/dev/xvda" ]]
    then
      # Rewrite the partition table so that the partition takes up all the space that it can.
      sudo growpart /dev/xvda 1

      # Expand the size of the file system.
      # Check if we're on AL2
      STR=$(cat /etc/os-release)
      SUB="VERSION_ID=\"2\""
      if [[ "$STR" == *"$SUB"* ]]
      then
        sudo xfs_growfs -d /
      else
        sudo resize2fs /dev/xvda1
      fi

    else
      # Rewrite the partition table so that the partition takes up all the space that it can.
      sudo growpart /dev/nvme0n1 1

      # Expand the size of the file system.
      # Check if we're on AL2
      STR=$(cat /etc/os-release)
      SUB="VERSION_ID=\"2\""
      if [[ "$STR" == *"$SUB"* ]]
      then
        sudo xfs_growfs -d /
      else
        sudo resize2fs /dev/nvme0n1p1
      fi
    fi
    ```

***

- 下記コマンドを実行し、作成した **resize.sh** を実行します(これ以降、コマンドを実行する際は **Cloud9** 環境のターミナルで実行してください)。

    ```bash
    bash resize.sh 20
    ```

- 正常終了すれば、拡張完了です。

***

### 2. リポジトリのクローンと解説

今回のアーキテクチャの構成と、実行する **Lambda** のコードを含むリポジトリをクローンし、解説していきます。

***

- 下記コマンドを実行し、リポジトリをクローンします。

    ```bash
    git clone https://github.com/matsuihidetoshi/ivs-viewers-count-cdk.git
    ```

***

- まず、リソース構築スクリプトの、 `ivs-viewers-count-cdk/blob/main/lib/ivs-viewers-count-cdk-stack.ts` から解説していきます。

    ```javascript
    import { Duration, Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
    import { Construct } from 'constructs';
    import { Table, BillingMode, AttributeType } from 'aws-cdk-lib/aws-dynamodb';
    import { Rule, Schedule } from 'aws-cdk-lib/aws-events';
    import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
    import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
    import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

    export class IvsViewersCountCdkStack extends Stack {
      constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        // ①視聴者数保存用の DynamoDB テーブルを作成
        const ivsViewersCountTable = new Table(this, "ivsViewersCountTable", {
          billingMode: BillingMode.PAY_PER_REQUEST,
          partitionKey: { name: 'channel', type: AttributeType.STRING },
          sortKey: { name: 'time', type: AttributeType.NUMBER },
          removalPolicy: RemovalPolicy.DESTROY
        });

        // ②Lambda 関数を作成
        const ivsViewersCountFunction = new NodejsFunction(this, "ivsViewersCountFunction", {
          entry: "src/ivs-viewers-count-function.handler.ts",
          environment: {
              TABLE_NAME: ivsViewersCountTable.tableName
          }
        });

        // ④Lambda 関数に、　DynamoDB の R/W 権限を付与
        ivsViewersCountTable.grantReadWriteData(ivsViewersCountFunction);
        
        // ⑤Lambda 関数に、 IVS へのアクセス権限を付与
        ivsViewersCountFunction.addToRolePolicy(new PolicyStatement({
          resources: [
            'arn:aws:ivs:us-east-1:*:channel/*'
          ],
          actions: [
            'ivs:ListChannels',
            'ivs:ListStreams',
            'ivs:PutMetadata'
          ]
        }));

        // ⑥Lambda 関数の定期呼び出し用の EventBridge ルールを作成
        new Rule(this, "ivsViewersCountRule", {
          schedule: Schedule.rate(Duration.minutes(1)),
          targets: [
            new LambdaFunction(ivsViewersCountFunction)
          ]
        });
      }
    }
    ```

