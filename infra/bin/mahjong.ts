#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { MahjongStack } from '../lib/mahjong-stack';

const app = new cdk.App();

// Staging stack (auto-deploys on push to main)
new MahjongStack(app, 'MahjongStaging', {
    environment: 'staging',
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: 'us-east-1', // Required for ACM certificates with CloudFront
    },
});

// Production stack (requires manual approval)
new MahjongStack(app, 'MahjongProduction', {
    environment: 'production',
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: 'us-east-1',
    },
});
