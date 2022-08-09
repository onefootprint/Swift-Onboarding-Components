import { ec2, Region, route53, } from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import { Output } from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as certHelper from './certs';
import * as pulumi from "@pulumi/pulumi"
import * as random from "@pulumi/random";

export type CdnConfig = {
    name: string,
    certArn: pulumi.Output<string>,
    source: string,
    target: string,
    cdnToAlbSecretHeaderName: string,
    cdnToAlbSecret: pulumi.Output<string>,
    hostedZoneId: string,
    requestPolicyId: pulumi.Output<string>,
    cachePolicyId: pulumi.Output<string>,
}

/**
 * Create OriginRequestPolicy and CachePolicy that is used for each cloudfront CDN
 */
export async function CreatePolicies(): Promise<[aws.cloudfront.OriginRequestPolicy, aws.cloudfront.CachePolicy]> {
    const requestPolicy = new aws.cloudfront.OriginRequestPolicy(`app-cdn-origin-req-policy`, {
        cookiesConfig: {
            cookieBehavior: "all"
        },
        queryStringsConfig: {
            queryStringBehavior: "all"
        },
        headersConfig: {
            headers: {
                items: [
                    "CloudFront-Viewer-Country-Name",
                    "CloudFront-Viewer-Country-Region",
                    "CloudFront-Viewer-Country-Region-Name",
                    "CloudFront-Viewer-City",
                    "CloudFront-Viewer-Postal-Code",
                    "CloudFront-Viewer-Time-Zone",
                    "CloudFront-Viewer-Latitude",
                    "CloudFront-Viewer-Longitude",
                    "CloudFront-Viewer-Metro-Code",
                    "CloudFront-Viewer-Address"
                ],
            },
            headerBehavior: "allViewerAndWhitelistCloudFront"
        }
    });

    const cachePolicy = new aws.cloudfront.CachePolicy(`app-cdn-origin-cache-policy`, {
        defaultTtl: 0,
        maxTtl: 0,
        minTtl: 0,
        parametersInCacheKeyAndForwardedToOrigin: {
            cookiesConfig: { cookieBehavior: "none" },
            headersConfig: { headerBehavior: "none" },
            queryStringsConfig: { queryStringBehavior: "none" }
        }
    });

    return [requestPolicy, cachePolicy]
}

/**
 * Create a Cloudfront distribution to front access to the app service ALBs
 */
export async function Create(config: CdnConfig): Promise<aws.cloudfront.Distribution> {
    // Cloudfront to front traffic for config.target
    const cdn = new aws.cloudfront.Distribution(`app-cdn-${config.name}`, {
        enabled: true,
        aliases: [config.source],
        origins: [{
            originId: config.target,
            domainName: config.target,
            customOriginConfig: {
                httpsPort: 443,
                httpPort: 80,
                originProtocolPolicy: "https-only",
                originSslProtocols: ["TLSv1.2"]
            },
            customHeaders: [
                {
                    name: config.cdnToAlbSecretHeaderName,
                    value: pulumi.secret(config.cdnToAlbSecret)
                },
            ]
        }],
        viewerCertificate: {
            acmCertificateArn: config.certArn,
            minimumProtocolVersion: "TLSv1.2_2021",
            sslSupportMethod: "sni-only"
        },
        defaultCacheBehavior: {
            targetOriginId: config.target,
            viewerProtocolPolicy: "redirect-to-https",
            allowedMethods: ["GET", "HEAD", "OPTIONS", "POST", "PUT", "DELETE", "PATCH"],
            cachedMethods: ["HEAD", "GET", "OPTIONS"],
            originRequestPolicyId: config.requestPolicyId,
            cachePolicyId: config.cachePolicyId,
        },

        restrictions: {
            geoRestriction: {
                restrictionType: "none",
            },
        },
    });

    // Route config.source -> cloudfront CDN
    new route53.Record(`cdn-record-${config.name}`, {
        zoneId: config.hostedZoneId,
        type: "A",
        name: config.source,
        aliases: [{
            name: cdn.domainName,
            zoneId: cdn.hostedZoneId,
            evaluateTargetHealth: true,
        }],
    });

    return cdn
}