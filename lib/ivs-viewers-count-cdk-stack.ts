import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as path from 'path';

export class IvsViewersCountCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const ivsViewersCountTable = new dynamodb.Table(this, "ivsViewersCountTable", {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: { name: 'channel', type: dynamodb.AttributeType.STRING }
    });

    const ivsViewersCountFunction = new lambda.Function(this, "ivsViewersCountFunction", {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: "handler",
      environment: {
          TABLE_NAME: ivsViewersCountTable.tableName
      },
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda/'))
    });
    ivsViewersCountTable.grantReadWriteData(ivsViewersCountFunction);

    new events.Rule(this, "sampleRule", {
      schedule: events.Schedule.rate(Duration.minutes(1)),
      targets: [
        new targets.LambdaFunction(ivsViewersCountFunction)
      ]
    });
  }
}
