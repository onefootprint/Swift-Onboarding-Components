/** @type {import('next').NextConfig} */

const IS_OUTPUT_STANDALONE = process.env.NEXT_BUILD_ENV_OUTPUT === 'standalone';

const ContentSecurityPolicy = `
  child-src onefootprint.com;
  connect-src 'self' localhost:8000 vitals.vercel-insights.com vercel.live *.ingest.sentry.io *.onefootprint.com *.pusher.com wss://*.pusher.com dvnfo.com 189225732777.collect.observeinc.com maps.googleapis.com unpkg.com https://*.fptls.com https://*.fptls2.com https://*.fptls3.com https://api.fpjs.io https://*.api.fpjs.io telemetry.stytch.com https://*.fptls.com https://*.fptls2.com https://*.fptls3.com https://api.fpjs.io https://*.api.fpjs.io telemetry.stytch.com https://*.logrocket.io https://*.lr-ingest.io https://*.logrocket.com https://*.lr-in.com https://*.lr-in-prod.com https://*.lr-ingest.com https://*.lr-ingest.com https://*.ingest-lr.com *.launchdarkly.com; 
  default-src 'self' vitals.vercel-insights.com;
  font-src 'self' fonts.googleapis.com fonts.gstatic.com;
  form-action 'self';
  frame-ancestors 'self';
  frame-src 'self' vercel.live;
  img-src 'self' data: assets.vercel.com vercel.live vercel.com i.onefp.net i-dev.onefp.net *.i-dev.onefp.net cdn.jsdelivr.net;
  media-src 'self' https;
  script-src 'self' 'unsafe-inline' 'unsafe-eval' vercel.live vitals.vercel-insights.com maps.googleapis.com fpnpmcdn.net js.dvnfo.com blob: https://cdn.jsdelivr.net docs.opencv.org elements.stytch.com https://cdn.logrocket.io https://cdn.lr-ingest.io https://cdn.lr-in.com https://cdn.lr-in-prod.com https://cdn.lr-ingest.com https://cdn.ingest-lr.com;
  style-src 'self' 'unsafe-inline' fonts.googleapis.com cdn.jsdelivr.net;
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
  transpilePackages: [
    '@onefootprint/idv-elements',
    '@onefootprint/idv',
    '@onefootprint/ui',
    '@onefootprint/styled',
    '@onefootprint/design-tokens',
    '@onefootprint/icons',
    '@onefootprint/global-constants',
    '@onefootprint/hooks',
    '@onefootprint/request',
    '@onefootprint/types',
    '@onefootprint/appearance',
  ],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
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
