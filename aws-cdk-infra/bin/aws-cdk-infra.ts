#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import {AwsCdkInfraStack} from '../lib/aws-cdk-infra-stack';


const app = new cdk.App();
new AwsCdkInfraStack(app, 'AwsCdkInfraStack', {
    /* Uncomment the next line to specialize this stack for the AWS Account
     * and Region that are implied by the current CLI configuration. */
    env: {account: process.env.AWS_ACCOUNT_ID, region: process.env.AWS_DEFAULT_REGION},
});