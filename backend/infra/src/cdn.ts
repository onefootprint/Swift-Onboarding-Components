import { route53 } from '@pulumi/aws';
import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';

export type CdnConfig = {
  certArn: pulumi.Output<string>;
  domain: string;
  origin: string;
  cdnToAlbSecretHeaderName: string;
  cdnToAlbSecret: pulumi.Output<string>;
  hostedZoneId: string;
};

/**
 * Create a Cloudfront distribution to front access to the app service ALBs
 */
export async function CreateCloudfrontDistribution(
  config: CdnConfig,
): Promise<aws.cloudfront.Distribution> {
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
      acmCertificateArn: config.certArn,
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

    restrictions: {
      geoRestriction: {
        restrictionType: 'none',
      },
    },
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
