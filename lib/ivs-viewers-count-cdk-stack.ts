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

    const ivsViewersCountTable = new Table(this, "ivsViewersCountTable", {
      billingMode: BillingMode.PAY_PER_REQUEST,
      partitionKey: { name: 'channel', type: AttributeType.STRING },
      sortKey: { name: 'time', type: AttributeType.NUMBER },
      removalPolicy: RemovalPolicy.DESTROY
    });

    const ivsViewersCountFunction = new NodejsFunction(this, "ivsViewersCountFunction", {
      entry: "src/ivs-viewers-count-function.handler.ts",
      environment: {
          TABLE_NAME: ivsViewersCountTable.tableName
      }
    });
    ivsViewersCountTable.grantReadWriteData(ivsViewersCountFunction);
    ivsViewersCountFunction.addToRolePolicy(new PolicyStatement({
      resources: [
        'arn:aws:ivs:ap-northeast-1:*:channel/*'
      ],
      actions: [
        'ivs:ListChannels',
        'ivs:ListStreams',
        'ivs:PutMetadata'
      ]
    }));

    new Rule(this, "ivsViewersCountRule", {
      schedule: Schedule.rate(Duration.minutes(1)),
      targets: [
        new LambdaFunction(ivsViewersCountFunction)
      ]
    });
  }
}
