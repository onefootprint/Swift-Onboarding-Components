import { ec2, Region, route53, } from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import { Output } from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as certHelper from './certs';
import * as pulumi from "@pulumi/pulumi"
import * as random from "@pulumi/random";

export type CdnConfig = {
    certArn: pulumi.Output<string>,
    domain: string,
    origin: string,
    cdnToAlbSecretHeaderName: string,
    cdnToAlbSecret: pulumi.Output<string>,
    hostedZoneId: string,
}

/**
 * Create a Cloudfront distribution to front access to the app service ALBs
 */
export async function Create(config: CdnConfig): Promise<aws.cloudfront.Distribution> {
    const requestPolicy = new aws.cloudfront.OriginRequestPolicy("app-cdn-origin-req-policy", {
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

    const cachePolicy = new aws.cloudfront.CachePolicy("app-cdn-origin-cache-policy", {
        defaultTtl: 0,
        maxTtl: 0,
        minTtl: 0,
        parametersInCacheKeyAndForwardedToOrigin: {
            cookiesConfig: { cookieBehavior: "none" },
            headersConfig: { headerBehavior: "none" },
            queryStringsConfig: { queryStringBehavior: "none" }
        }
    });

    const cdn = new aws.cloudfront.Distribution("app-cdn", {
        enabled: true,
        aliases: [config.domain],
        origins: [{
            originId: config.origin,
            domainName: config.origin,
            customOriginConfig: {
                httpsPort: 443,
                httpPort: 80,
                originProtocolPolicy: "https-only",
                originSslProtocols: ["TLSv1.2"],
                originReadTimeout: 60
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
            targetOriginId: config.origin,
            viewerProtocolPolicy: "redirect-to-https",
            allowedMethods: ["GET", "HEAD", "OPTIONS", "POST", "PUT", "DELETE", "PATCH"],
            cachedMethods: ["HEAD", "GET", "OPTIONS"],
            originRequestPolicyId: requestPolicy.id,
            cachePolicyId: cachePolicy.id,            
        },

        restrictions: {
            geoRestriction: {
                restrictionType: "none",
            },
        },
    });

    new route53.Record(`cdn-record`, {
        zoneId: config.hostedZoneId,
        type: "A",
        name: config.domain,
        aliases: [{
            name: cdn.domainName,
            zoneId: cdn.hostedZoneId,
            evaluateTargetHealth: true,
        }
        ],
    });

    return cdn
}
