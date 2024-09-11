/** @type {import('next').NextConfig} */

const BundleAnalyzer = require('@next/bundle-analyzer');

const IS_DEV = process.env.NODE_ENV === 'development';

const DATADOG_SRC = [
  'https://browser-intake-datadoghq.com',
  'https://rum.browser-intake-datadoghq.com',
  'https://session-replay.browser-intake-datadoghq.com',
].join(' ');

const IS_OUTPUT_STANDALONE = process.env.NEXT_BUILD_ENV_OUTPUT === 'standalone';

const DEV_CONNECT_SRC = (IS_DEV ? ['http://localhost:8000', 'http://127.0.0.1:8000'] : []).join(' ');

const ContentSecurityPolicy = `
  child-src blob: onefootprint.com;
  connect-src 'self' data: ${DEV_CONNECT_SRC} vitals.vercel-insights.com vercel.live *.onefootprint.com *.pusher.com wss://*.pusher.com maps.googleapis.com unpkg.com https://*.fptls.com https://*.fptls2.com https://*.fptls3.com https://api.fpjs.io https://*.api.fpjs.io telemetry.stytch.com https://*.fptls.com https://*.fptls2.com https://*.fptls3.com https://api.fpjs.io https://*.api.fpjs.io telemetry.stytch.com *.launchdarkly.com ${DATADOG_SRC};
  default-src 'self' vitals.vercel-insights.com;
  font-src 'self' fonts.googleapis.com fonts.gstatic.com i.onefp.net;
  form-action 'self';
  frame-ancestors 'self';
  frame-src 'self' vercel.live;
  img-src 'self' data: assets.vercel.com vercel.live vercel.com i.onefp.net i-dev.onefp.net *.i-dev.onefp.net cdn.jsdelivr.net;
  media-src 'self' https;
  script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: vercel.live vitals.vercel-insights.com maps.googleapis.com fpnpmcdn.net blob: https://cdn.jsdelivr.net docs.opencv.org elements.stytch.com ${DATADOG_SRC};
  style-src 'self' 'unsafe-inline' fonts.googleapis.com cdn.jsdelivr.net i.onefp.net;
  worker-src 'self' blob:;
`;

const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=*, publickey-credentials-get=*, geolocation=*',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim(),
  },
];

const nextConfig = {
  pageExtensions: ['page.tsx', 'page.ts', 'page.jsx', 'page.js'],
  reactStrictMode: false,
  compiler: {
    styledComponents: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '*.onefp.net' }],
  },
  transpilePackages: [
    '@onefootprint/idv-elements',
    '@onefootprint/idv',
    '@onefootprint/ui',
    '@onefootprint/design-tokens',
    '@onefootprint/icons',
    '@onefootprint/global-constants',
    '@onefootprint/hooks',
    '@onefootprint/request',
    '@onefootprint/types',
    '@onefootprint/appearance',
    '@radix-ui',
  ],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        source: '/locales/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, maxage=1, s-maxage=1, stale-while-revalidate=59 must-revalidate',
          },
          {
            key: 'CDN-Cache-Control',
            value: 'public, maxage=1, s-maxage=1, stale-while-revalidate=59 must-revalidate',
          },
          {
            key: 'Vercel-CDN-Cache-Control',
            value: 'public, maxage=1, s-maxage=1, stale-while-revalidate=59 must-revalidate',
          },
        ],
      },
    ];
  },
  env: {
    CI: process.env.CI,
    IS_E2E: process.env.IS_E2E,
  },
};

if (IS_OUTPUT_STANDALONE) {
  nextConfig.output = 'standalone';
}

module.exports = nextConfig;

const IS_ANALYZE_ACTIVE = process.env.ANALYZE === 'true';
if (IS_ANALYZE_ACTIVE) {
  console.log('📊 Showing bundle analyzer');
  module.exports = BundleAnalyzer({ enabled: true })(nextConfig);
}
