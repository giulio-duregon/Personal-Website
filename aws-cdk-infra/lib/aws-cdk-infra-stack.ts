import * as cdk from 'aws-cdk-lib';
import {aws_certificatemanager, aws_ecs_patterns, aws_route53_targets} from 'aws-cdk-lib';
import {
    cluster_props,
    cpu_scaling_props,
    fargate_props,
    healthcheck_props,
    hosted_zone_props,
    scaling_props,
    vpc_props,
    website_domain_name
} from './conf'
import {Construct} from 'constructs';
import {RecordTarget} from "aws-cdk-lib/aws-route53";
import {CertificateValidation} from "aws-cdk-lib/aws-certificatemanager";
import {ApplicationProtocol, ListenerAction} from "aws-cdk-lib/aws-elasticloadbalancingv2";
import ec2 = require('aws-cdk-lib/aws-ec2');
import ecs = require('aws-cdk-lib/aws-ecs');
import route53 = require('aws-cdk-lib/aws-route53');

export class AwsCdkInfraStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);


        // Get hosted zone from domain name
        const hosted_zone = route53.HostedZone.fromLookup(this, "website-hosted-zone", {
            domainName: hosted_zone_props.domainName,
            privateZone: hosted_zone_props.privateZone,
        })

        // VPC network for cluster
        const vpc = new ec2.Vpc(this, "website-app-vpc", {
            maxAzs: vpc_props.maxAzs,
            natGateways: vpc_props.natGateways,
        })


        // Cluster setup
        const homePageCluster = new ecs.Cluster(this, "giulio-duregon-cluster",
            {
                vpc: vpc,
                clusterName: cluster_props.clusterName,
            })


        // Set up CPU / Mem for container cluster
        const websiteApp = new aws_ecs_patterns.ApplicationLoadBalancedFargateService(this,
            "giulio-duregon-website-application",
            {
                cluster: homePageCluster,
                desiredCount: fargate_props.desiredCount,
                cpu: fargate_props.cpu,
                assignPublicIp: true,
                memoryLimitMiB: fargate_props.memoryLimitMiB,
                taskImageOptions: {
                    image: fargate_props.taskImageOptions.image,
                    containerPort: fargate_props.taskImageOptions.containerPort,
                    entryPoint: ["java", "-jar", "/app.jar"],
                }
            }
        )

        // Configure health check for cluster
        websiteApp.targetGroup.configureHealthCheck({
            port: healthcheck_props.port,
            path: healthcheck_props.path,
            interval: healthcheck_props.interval,
            timeout: healthcheck_props.timeout,
            healthyThresholdCount: healthcheck_props.healthyThresholdCount,
            unhealthyThresholdCount: healthcheck_props.unhealthyThresholdCount,
            healthyHttpCodes: healthcheck_props.healthyHttpCodes,
        })

        // Configure Auto Scaling
        const websiteAutoScaling = websiteApp.service.autoScaleTaskCount({
            maxCapacity: scaling_props.maxCapacity,
            minCapacity: scaling_props.minCapacity,
        })

        // Configure CPU-based auto-scaling
        websiteAutoScaling.scaleOnCpuUtilization("cpu-autoscaling",
            {
                targetUtilizationPercent: cpu_scaling_props.targetUtilizationPercent,
                policyName: cpu_scaling_props.policyName,
                scaleInCooldown: cpu_scaling_props.scaleInCooldown,
                scaleOutCooldown: cpu_scaling_props.scaleOutCooldown,
            })

        // Set up default A record for domain
        const record = new route53.ARecord(this, "website-routing-record", {
            zone: hosted_zone,
            recordName: website_domain_name,
            target: RecordTarget.fromAlias(new aws_route53_targets.LoadBalancerTarget(websiteApp.loadBalancer)),
        })

        // Set up alternative A record for www subdomain
        const www_record = new route53.ARecord(this, "www-website-routing-record", {
            zone: hosted_zone,
            recordName: "www." + website_domain_name,
            target: RecordTarget.fromAlias(new aws_route53_targets.LoadBalancerTarget(websiteApp.loadBalancer)),
        })

        // Get SSL Certificate from DNS for HTTPS connections
        const certificate = new aws_certificatemanager.Certificate(this, "SSL-Certificate", {
            domainName: website_domain_name,
            subjectAlternativeNames: ["www." + website_domain_name],
            validation: CertificateValidation.fromDns(hosted_zone)
        })

        // Add listener to load balancer for HTTPS connections on Port 443
        websiteApp.loadBalancer.addListener("HTTPS-Listener",
            {
                protocol: ApplicationProtocol.HTTPS,
                port: 443,
                certificates: [certificate],
                defaultAction: ListenerAction.forward([websiteApp.targetGroup])
            })
    }
}
