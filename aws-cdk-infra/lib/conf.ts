import ecs = require('aws-cdk-lib/aws-ecs');
import * as cdk from 'aws-cdk-lib';

/* Sets up configuration for stack rather than hardcoding values.
* vpc_props: properties for configuring aws_ec2.Vpc
* cluster_props: properties for configuring aws_ecs.Cluster
* fargate_props: properties for configuring aws_ecs_patterns.ApplicationLoadBalancedFargateServiceProps*
 */

export const website_domain_name = "giulio-duregon.com"

export const hosted_zone_props = {
    domainName: "giulio-duregon.com",
    privateZone: false,
}
export const vpc_props = {
    maxAzs: 2,
    natGateways: 1
}

export const cluster_props = {
    clusterName: "giulio-duregon-application-cluster",
}

export const fargate_props = {
    desiredCount: 1,
    cpu: 256,
    memoryLimitMiB: 512,
    assignPublicIp: true,
    taskImageOptions: {
        image: ecs.ContainerImage.fromAsset('../giulio-duregon.com'),
        containerPort: 8080
    }
}

export const healthcheck_props = {
    port: 'traffic-port',
    path: '/actuator/health',
    interval: cdk.Duration.seconds(10),
    timeout: cdk.Duration.seconds(8),
    healthyThresholdCount: 2,
    unhealthyThresholdCount: 2,
    healthyHttpCodes: "200,301,302",
}

export const scaling_props = {
    maxCapacity: 2,
    minCapacity: 1,
}

export const cpu_scaling_props = {
    targetUtilizationPercent: 80,
    policyName: "cpu-autoscaling-policy",
    scaleInCooldown: cdk.Duration.minutes(1),
    scaleOutCooldown: cdk.Duration.minutes(1)
}