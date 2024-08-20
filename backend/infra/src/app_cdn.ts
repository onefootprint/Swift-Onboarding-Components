import { route53 } from '@pulumi/aws';
import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';
import { Certificate } from './certs';
import { StackEnvironment, StackMetadata } from './stack_metadata';
import { APP_CDN_WAF_RULES, RATE_LIMIT_EXCEEDED_RESPONSE_BODY_KEY } from './app_cdn_waf';

export type CdnConfig = {
  cert: Certificate;
  domain: string;
  origin: string;
  cdnToAlbSecretHeaderName: string;
  cdnToAlbSecret: pulumi.Output<string>;
  hostedZoneId: string;
  stack: StackMetadata;
};

/**
 * Create a Cloudfront distribution to front access to the app service ALBs
 */
export function CreateAppCloudfrontDistribution(
  config: CdnConfig,
): aws.cloudfront.Distribution {
  const requestPolicy = new aws.cloudfront.OriginRequestPolicy(
    'app-cdn-origin-req-policy',
    {
      cookiesConfig: {
        cookieBehavior: 'all',
      },
      queryStringsConfig: {
        queryStringBehavior: 'all',
      },
      headersConfig: {
        headers: {
          items: [
            'CloudFront-Viewer-Country-Name',
            'CloudFront-Viewer-Country-Region',
            'CloudFront-Viewer-Country-Region-Name',
            'CloudFront-Viewer-City',
            'CloudFront-Viewer-Postal-Code',
            'CloudFront-Viewer-Time-Zone',
            'CloudFront-Viewer-Latitude',
            'CloudFront-Viewer-Longitude',
            'CloudFront-Viewer-Metro-Code',
            'CloudFront-Viewer-Address',
            'CloudFront-Is-Android-Viewer',
            'CloudFront-Is-Desktop-Viewer',
            'CloudFront-Is-IOS-Viewer',
            'CloudFront-Is-Mobile-Viewer',
            'CloudFront-Is-SmartTV-Viewer',
            'CloudFront-Is-Tablet-Viewer',
            'CloudFront-Viewer-ASN',
            'CloudFront-Viewer-Country',
            'CloudFront-Forwarded-Proto',
            'CloudFront-Viewer-Http-Version',
            'CloudFront-Viewer-TLS',
          ],
        },
        headerBehavior: 'allViewerAndWhitelistCloudFront',
      },
    },
  );

  // add basic security headers
  const responsePolicy = new aws.cloudfront.ResponseHeadersPolicy(
    'app-cdn-origin-response-policy',
    {
      comment: 'security headers',
      customHeadersConfig: {
        items: [
          {
            header: 'server',
            value: 'footprint',
            override: true,
          },
        ],
      },
      securityHeadersConfig: {
        strictTransportSecurity: {
          accessControlMaxAgeSec: 31536000,
          includeSubdomains: true,
          override: true,
        },
        contentSecurityPolicy: {
          contentSecurityPolicy:
            "default-src 'self';base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self' unpkg.com;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests",
          override: false,
        },
        frameOptions: {
          override: false,
          frameOption: 'SAMEORIGIN',
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
          referrerPolicy: 'origin-when-cross-origin',
          override: true,
        },
      },
    },
  );

  const cachePolicy = new aws.cloudfront.CachePolicy(
    'app-cdn-origin-cache-policy',
    {
      defaultTtl: 0,
      maxTtl: 0,
      minTtl: 0,
      parametersInCacheKeyAndForwardedToOrigin: {
        cookiesConfig: { cookieBehavior: 'none' },
        headersConfig: { headerBehavior: 'none' },
        queryStringsConfig: { queryStringBehavior: 'none' },
      },
    },
  );

  // Create the WAF (Web Application Firewall)
  const waf = new aws.wafv2.WebAcl('app-cdb-waf', {
    name: `AppCDNWAF-${config.stack.shortStackName}`,
    visibilityConfig: {
      metricName: 'appCdnWAF',
      cloudwatchMetricsEnabled: true,
      // Critical: Disable sampling to avoid leaking API keys.
      sampledRequestsEnabled: false,
    },
    defaultAction: {
      allow: {
        customRequestHandling: {
          insertHeaders: [{ name: 'cloudfront-waf-action', value: 'allow' }],
        },
      },
    },
    scope: 'CLOUDFRONT',
    customResponseBodies: [
      {
        key: RATE_LIMIT_EXCEEDED_RESPONSE_BODY_KEY,
        contentType: 'APPLICATION_JSON',
        content: '{"message": "Rate limit exceeded"}',
      }
    ],
    rules: APP_CDN_WAF_RULES,
  });

  const logBucket = createLogBucket(config);

  const cdn = new aws.cloudfront.Distribution('app-cdn', {
    enabled: true,
    aliases: [config.domain],
    origins: [
      {
        originId: config.origin,
        domainName: config.origin,
        customOriginConfig: {
          httpsPort: 443,
          httpPort: 80,
          originProtocolPolicy: 'https-only',
          originSslProtocols: ['TLSv1.2'],
          originReadTimeout: 60,
        },
        customHeaders: [
          {
            name: config.cdnToAlbSecretHeaderName,
            value: pulumi.secret(config.cdnToAlbSecret),
          },
        ],
      },
    ],
    viewerCertificate: {
      acmCertificateArn: config.cert.arn,
      minimumProtocolVersion: 'TLSv1.2_2021',
      sslSupportMethod: 'sni-only',
    },
    defaultCacheBehavior: {
      targetOriginId: config.origin,
      viewerProtocolPolicy: 'redirect-to-https',
      allowedMethods: [
        'GET',
        'HEAD',
        'OPTIONS',
        'POST',
        'PUT',
        'DELETE',
        'PATCH',
      ],
      cachedMethods: ['HEAD', 'GET', 'OPTIONS'],
      originRequestPolicyId: requestPolicy.id,
      cachePolicyId: cachePolicy.id,
      responseHeadersPolicyId: responsePolicy.id,
    },
    loggingConfig: {
      bucket: logBucket,
      includeCookies: false,
      prefix: 'appcdn',
    },
    restrictions: {
      geoRestriction: {
        restrictionType: 'none',
      },
    },
    webAclId: waf.arn,
  });

  new route53.Record(`cdn-record`, {
    zoneId: config.hostedZoneId,
    type: 'A',
    name: config.domain,
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

function createLogBucket(config: CdnConfig): pulumi.Output<string> {
  const bucketName = `app-cdn-logs-${config.stack.shortStackName}`;

  const current = aws.s3.getCanonicalUserId({});
  const cfId = aws.cloudfront.getLogDeliveryCanonicalUserId({});

  const bucket = new aws.s3.Bucket(bucketName, {
    forceDestroy: config.stack.environment === StackEnvironment.DevEphemeral,
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
        objectOwnership: 'BucketOwnerPreferred',
      },
    },
  );

  const acl = new aws.s3.BucketAclV2(
    `${bucketName}-acl`,
    {
      bucket: bucket.id,
      accessControlPolicy: {
        owner: {
          id: current.then(current => current.id),
        },
        grants: [
          {
            grantee: {
              id: cfId.then(id => id.id),
              type: 'CanonicalUser',
            },
            permission: 'FULL_CONTROL',
          },
        ],
      },
    },
    {
      dependsOn: [controls],
    },
  );

  return bucket.bucketDomainName;
}
