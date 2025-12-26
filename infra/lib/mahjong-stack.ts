import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';

export interface MahjongStackProps extends cdk.StackProps {
    environment: 'staging' | 'production';
}

export class MahjongStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: MahjongStackProps) {
        super(scope, id, props);

        const isProduction = props.environment === 'production';
        const envPrefix = isProduction ? 'Prod' : 'Stage';

        // Domain configuration
        const domainName = isProduction ? 'mahjong.jfiacco.com' : 'mahjong-staging.jfiacco.com';
        const hostedZoneId = 'Z07910653PB1T13XGLOAW'; // jfiacco.com hosted zone

        // 1. S3 Bucket (Private, accessed via CloudFront OAC)
        const siteBucket = new s3.Bucket(this, `${envPrefix}SiteBucket`, {
            publicReadAccess: false,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
        });

        // 2. Look up existing hosted zone
        const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
            hostedZoneId: hostedZoneId,
            zoneName: 'jfiacco.com',
        });

        // 3. ACM Certificate (must be in us-east-1 for CloudFront)
        const certificate = new acm.Certificate(this, `${envPrefix}Certificate`, {
            domainName: domainName,
            validation: acm.CertificateValidation.fromDns(hostedZone),
        });

        // 4. CloudFront Distribution
        const distribution = new cloudfront.Distribution(this, `${envPrefix}Distribution`, {
            defaultBehavior: {
                origin: origins.S3BucketOrigin.withOriginAccessControl(siteBucket),
                viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
            },
            domainNames: [domainName],
            certificate,
            defaultRootObject: 'index.html',
            errorResponses: [
                {
                    httpStatus: 404,
                    responseHttpStatus: 200,
                    responsePagePath: '/index.html', // SPA fallback
                    ttl: cdk.Duration.minutes(5),
                },
                {
                    httpStatus: 403,
                    responseHttpStatus: 200,
                    responsePagePath: '/index.html', // SPA fallback
                    ttl: cdk.Duration.minutes(5),
                },
            ],
        });

        // 5. Route53 A Record
        new route53.ARecord(this, `${envPrefix}AliasRecord`, {
            zone: hostedZone,
            recordName: isProduction ? 'mahjong' : 'mahjong-staging',
            target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
        });

        // 6. Deploy site assets
        new s3deploy.BucketDeployment(this, `${envPrefix}Deploy`, {
            sources: [s3deploy.Source.asset('../dist')],
            destinationBucket: siteBucket,
            distribution,
            distributionPaths: ['/*'],
        });

        // Outputs
        new cdk.CfnOutput(this, `${envPrefix}SiteURL`, {
            value: `https://${domainName}`,
            description: `Mahjong Solitaire URL (${props.environment})`,
        });

        new cdk.CfnOutput(this, `${envPrefix}CloudFrontURL`, {
            value: `https://${distribution.distributionDomainName}`,
            description: `CloudFront distribution URL (${props.environment})`,
        });

        new cdk.CfnOutput(this, `${envPrefix}BucketName`, {
            value: siteBucket.bucketName,
            description: `S3 bucket name (${props.environment})`,
        });
    }
}
