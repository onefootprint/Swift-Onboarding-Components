import { S3BucketConfig } from './s3';
import { Region, route53 } from '@pulumi/aws';
import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';

import { CreateRegionalWildCertificateForDnsConfig } from './certs';
import { Config } from './config';
import { StackEnvironment, StackMetadata } from './stack_metadata';

export type AssetCdn = {
  cdn: aws.cloudfront.Distribution;
  origin: string;
  hostedZoneId: string;
};

/**
 * Creates our Asset CDN to front the assets S3 Bucket
 */
export async function CreateAssetCdn(
  constants: Config,
  stack: StackMetadata,
  assetsBucket: S3BucketConfig,
): Promise<AssetCdn> {
  const hostedZoneId = (
    await aws.route53.getZone({ name: constants.domain.assets })
  ).id;

  let domain: string;
  if (stack.environment === StackEnvironment.DevEphemeral) {
    // for ephemeral we must use a separate DNS name
    domain = `${stack.shortStackName}.${constants.domain.assets}`;
  } else {
    domain = constants.domain.assets;
  }

  // const logsBucket = new aws.s3.Bucket('requestLogs', {
  //   forceDestroy: !constants.deletionProtection,
  //   bucket: `${domain}-logs`,
  //   acl: 'public-read-write',
  // });

  // new aws.s3.BucketOwnershipControls('asset-requestLogs-ownc', {
  //   bucket: logsBucket.id,
  //   rule: {
  //     objectOwnership: 'ObjectWriter',
  //   },
  // });

  // new aws.s3.BucketAclV2('requestLogsAcl', {
  //   bucket: logsBucket.id,
  //   acl: 'log-delivery-write',
  // });

  // create an access identity for CDN -> S3
  const originAccessIdentity = new aws.cloudfront.OriginAccessIdentity(
    'asset_cdn_origin_access_id',
    {
      comment: 'this is needed to setup s3 polices and make s3 not public.',
    },
  );

  new aws.s3.BucketPolicy('asset_cdn_bucket_policy', {
    bucket: assetsBucket.bucket.id, // refer to the bucket created earlier
    policy: pulumi
      .all([originAccessIdentity.iamArn, assetsBucket.bucket.arn])
      .apply(([oaiArn, bucketArn]) =>
        JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: {
                AWS: oaiArn,
              },
              // Only allow Cloudfront read access.
              Action: ['s3:GetObject'],
              // Give Cloudfront access to the entire bucket.
              Resource: [`${bucketArn}/*`],
            },
          ],
        }),
      ),
  });

  // Create our cert (must be us-east-1)
  const cert = CreateRegionalWildCertificateForDnsConfig({
    domain: domain,
    hostedZoneId,
    region: Region.USEast1,
  });

  // Configure CORS and security headers.
  const responsePolicy = new aws.cloudfront.ResponseHeadersPolicy(
    'asset-cdn-origin-response-policy',
    {
      comment: 'security-headers',
      corsConfig: {
        accessControlAllowCredentials: false,
        accessControlAllowHeaders: {
          // Implicitly excludes Authorization header.
          items: ['*'],
        },
        accessControlAllowMethods: {
          items: ['GET', 'HEAD', 'OPTIONS'],
        },
        accessControlAllowOrigins: {
          // CloudFront allows a wider range of origin specifications than CORS
          // headers themselves.
          // https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/understanding-response-headers-policies.html
          items: ['http://localhost:*', 'https://*.onefootprint.com'],
        },
        // When set to true and the origin response contains a CORS header
        // that's also in the policy, CloudFront adds the CORS header in the
        // policy to the response. CloudFront then sends that response to the
        // viewer. CloudFront ignores the header that it received from the
        // origin.
        originOverride: true,
      },
      securityHeadersConfig: {
        strictTransportSecurity: {
          accessControlMaxAgeSec: 31536000,
          override: false,
        },
        contentSecurityPolicy: {
          contentSecurityPolicy:
            "default-src 'none'",
          override: true,
        },
        frameOptions: {
          frameOption: 'SAMEORIGIN',
          override: false,
        },
        contentTypeOptions: {
          override: true,
        },
        xssProtection: {
          protection: true,
          modeBlock: true,
          override: true,
        },
        referrerPolicy: {
          referrerPolicy: 'strict-origin-when-cross-origin',
          override: true,
        },
      },
    },
  );

  // create the CDN
  const distributionArgs: aws.cloudfront.DistributionArgs = {
    enabled: true,
    aliases: [domain],

    // We only specify one origin for this distribution, the S3 content bucket.
    origins: [
      {
        originId: assetsBucket.bucket.arn,
        domainName: assetsBucket.bucket.bucketDomainName,
        s3OriginConfig: {
          originAccessIdentity:
            originAccessIdentity.cloudfrontAccessIdentityPath,
        },
      },
    ],

    // A CloudFront distribution can configure different cache behaviors based on the request path.
    // Here we just specify a single, default cache behavior which is just read-only requests to S3.
    defaultCacheBehavior: {
      targetOriginId: assetsBucket.bucket.arn,

      viewerProtocolPolicy: 'redirect-to-https',
      allowedMethods: ['GET', 'HEAD', 'OPTIONS'],
      cachedMethods: ['GET', 'HEAD', 'OPTIONS'],

      forwardedValues: {
        cookies: { forward: 'none' },
        queryString: true,
        headers: [
          'Access-Control-Request-Headers',
          'Access-Control-Request-Method',
          'Origin',
        ],
      },
      responseHeadersPolicyId: responsePolicy.id,

      minTtl: 0,
      defaultTtl: 10 * 60,
      maxTtl: 10 * 60,
    },

    // "All" is the most broad distribution, and also the most expensive.
    // "100" is the least broad, and also the least expensive.
    priceClass: 'PriceClass_100',

    restrictions: {
      geoRestriction: {
        restrictionType: 'none',
      },
    },

    viewerCertificate: {
      acmCertificateArn: cert.arn,
      sslSupportMethod: 'sni-only',
    },

    // loggingConfig: {
    //   bucket: logsBucket.bucketDomainName,
    //   includeCookies: false,
    //   prefix: `${domain}/`,
    // },
  };

  const cdn = new aws.cloudfront.Distribution('asset_cdn', distributionArgs);

  // set DNS record
  new route53.Record(`asset-cdn-record`, {
    zoneId: hostedZoneId,
    type: 'A',
    name: domain,
    aliases: [
      {
        name: cdn.domainName,
        zoneId: cdn.hostedZoneId,
        evaluateTargetHealth: true,
      },
    ],
  });

  return { cdn, hostedZoneId, origin: `https://${domain}` };
}
