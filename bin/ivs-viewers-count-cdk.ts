#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { InformationProxyStack } from '../lib/information-proxy-stack';

const app = new cdk.App();
new InformationProxyStack(app, 'InformationProxyStack', {
  env: { region: 'ap-northeast-1' }
});