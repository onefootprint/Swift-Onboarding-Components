import { route53 } from "@pulumi/aws";
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import * as certs from "./certs";
import { StackEnvironment, StackMetadata } from "./stack_metadata";
import { Config } from "./config";

/**
* Create a Cloudfront distribution to front access to id.onefootprint.com
* our vercel-based embedded flow
*/
export async function CreateId2CloudfrontDistribution(
    constants: Config,
    stack: StackMetadata
): Promise<aws.cloudfront.Distribution> {
    
    const hostedZoneId = (
        await aws.route53.getZone({ name: constants.domain.id2Base })
    ).id;
    
    let domain: string;
    if (stack.environment === StackEnvironment.DevEphemeral) {
        // for ephemeral we must use a separate DNS name
        domain = `${stack.shortStackName}-${constants.domain.id2Prefix}${constants.domain.id2Base}`;
    } else {
        domain = `${constants.domain.id2Prefix}${constants.domain.id2Base}`;
    }
    
    // this is where we will point the CDN
    let origin = constants.domain.idOrigin;

    // generate a certificate
    const cert = certs.CreateRegionalWildCertificateForDnsConfig({
        domain,
        hostedZoneId,
        region: aws.Region.USEast1,
    });
    
    
    // create the cdn
    const requestPolicy = new aws.cloudfront.OriginRequestPolicy(
        "id2-cdn-origin-req-policy",
        {
            cookiesConfig: {
                cookieBehavior: "all",
            },
            queryStringsConfig: {
                queryStringBehavior: "all",
            },
            headersConfig: {
                headers: {
                    items: [
                        'Host',
                    ]
                },
                headerBehavior: "allExcept",
            },
        }
    );
    
    const responsePolicy = new aws.cloudfront.ResponseHeadersPolicy(
        "id2-cdn-origin-response-policy",
        {
            comment: "security headers",
            customHeadersConfig: {
                items: [
                    {
                        header: "server",
                        value: "footprint-id2",
                        override: true,
                    },
                ],
            },
            securityHeadersConfig: {},
        }
    );
    
    const cachePolicy = new aws.cloudfront.CachePolicy(
        "id2-cdn-origin-cache-policy",
        {
            defaultTtl: 0,
            maxTtl: 0,
            minTtl: 0,
            parametersInCacheKeyAndForwardedToOrigin: {
                cookiesConfig: { cookieBehavior: "none" },
                headersConfig: { headerBehavior: "none" },
                queryStringsConfig: { queryStringBehavior: "none" },
            },
        }
    );
    
    const logBucket = createLogBucket(stack);
    
    const cdn = new aws.cloudfront.Distribution("id2-cdn", {
        enabled: true,
        aliases: [domain],
        origins: [
            {
                originId: origin,
                domainName: origin,
                customOriginConfig: {
                    httpsPort: 443,
                    httpPort: 80,
                    originProtocolPolicy: "https-only",
                    originSslProtocols: ["TLSv1.2"],
                    originReadTimeout: 60,
                },
                customHeaders: [
                    {
                        name: "x-footprint-id2-cdn",
                        value: "true",
                    },
                ],
            },
        ],
        viewerCertificate: {
            acmCertificateArn: cert.arn,
            minimumProtocolVersion: "TLSv1.2_2021",
            sslSupportMethod: "sni-only",
        },
        defaultCacheBehavior: {
            targetOriginId: origin,
            viewerProtocolPolicy: "redirect-to-https",
            allowedMethods: [
                "GET",
                "HEAD",
                "OPTIONS",
                "POST",
                "PUT",
                "DELETE",
                "PATCH",
            ],
            cachedMethods: ["HEAD", "GET", "OPTIONS"],
            originRequestPolicyId: requestPolicy.id,
            cachePolicyId: cachePolicy.id,
            responseHeadersPolicyId: responsePolicy.id,
        },
        loggingConfig: {
            bucket: logBucket,
            includeCookies: false,
            prefix: "id2cdn",
        },
        restrictions: {
            geoRestriction: {
                restrictionType: "none",
            },
        },
    });
    
    new route53.Record(`id2-cdn-record`, {
        zoneId: hostedZoneId,
        type: "A",
        name: domain,
        aliases: [
            {
                name: cdn.domainName,
                zoneId: cdn.hostedZoneId,
                evaluateTargetHealth: true,
            },
        ],
    });
    
    return cdn;
}

function createLogBucket(stack: StackMetadata): pulumi.Output<string> {
    const bucketName = `id2-cdn-logs-${stack.shortStackName}`;
    
    const current = aws.s3.getCanonicalUserId({});
    const cfId = aws.cloudfront.getLogDeliveryCanonicalUserId({});
    
    const bucket = new aws.s3.Bucket(bucketName, {
        forceDestroy: stack.environment === StackEnvironment.DevEphemeral,
        bucket: bucketName,
        versioning: {
            enabled: true,
        },
    });
    
    const controls = new aws.s3.BucketOwnershipControls(
        `${bucketName}-controls`,
        {
            bucket: bucket.id,
            rule: {
                objectOwnership: "BucketOwnerPreferred",
            },
        }
    );
    
    const acl = new aws.s3.BucketAclV2(
        `${bucketName}-acl`,
        {
            bucket: bucket.id,
            accessControlPolicy: {
                owner: {
                    id: current.then((current) => current.id),
                },
                grants: [
                    {
                        grantee: {
                            id: cfId.then((id) => id.id),
                            type: "CanonicalUser",
                        },
                        permission: "FULL_CONTROL",
                    },
                ],
            },
        },
        {
            dependsOn: [controls],
        }
    );
    
    return bucket.bucketDomainName;
}
