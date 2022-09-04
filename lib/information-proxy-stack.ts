import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Rule, Schedule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

export class InformationProxyStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const s3BucketName = scope.node.tryGetContext('s3BucketName')
    const sourceApiEndpoint = scope.node.tryGetContext('sourceApiEndpoint')

    const informationProxyFunction = new NodejsFunction(this, "informationProxyFunction", {
      entry: "src/information-proxy-function.handler.ts",
      environment: {
        SOURCE_API_ENDPOINT: sourceApiEndpoint,
        S3_BUCKET_NAME: s3BucketName,
      },
      timeout: Duration.seconds(30),
    });

    informationProxyFunction.addToRolePolicy(new PolicyStatement({
      resources: [
        `arn:aws:s3:::${s3BucketName}/*`
      ],
      actions: [
        's3:GetObject',
        's3:PutObject',
        's3:DeleteObject',
      ]
    }));

    new Rule(this, "informationProxyRule", {
      schedule: Schedule.rate(Duration.minutes(1)),
      targets: [
        new LambdaFunction(informationProxyFunction)
      ]
    });
  }
}
