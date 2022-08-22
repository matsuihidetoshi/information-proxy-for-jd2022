#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { IvsViewersCountCdkStack } from '../lib/ivs-viewers-count-cdk-stack';

const app = new cdk.App();
new IvsViewersCountCdkStack(app, 'IvsViewersCountCdkStack', {
  env: { region: 'ap-northeast-1' }
});