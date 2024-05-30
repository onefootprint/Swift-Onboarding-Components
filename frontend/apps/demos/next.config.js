/** @type {import('next').NextConfig} */

const IS_CI = process.env.CI === 'true';
const IS_DEV = process.env.NODE_ENV === 'development';
const IS_ANALYZE_ACTIVE = process.env.ANALYZE === 'true';
const IS_OUTPUT_STANDALONE = process.env.NEXT_BUILD_ENV_OUTPUT === 'standalone';

const DEV_CONNECT_SRC = (
  IS_DEV ? ['http://localhost:8000', 'http://127.0.0.1:8000'] : []
).join(' ');

const DEV_FRAME_SRC = (
  IS_DEV || IS_CI
    ? [
        'http://localhost:3000',
        'http://localhost:3010',
        'http://localhost:3011',
      ]
    : []
).join(' ');

const ContentSecurityPolicy = `
  child-src onefootprint.com;
  connect-src 'self' *.onefootprint.com ${DEV_CONNECT_SRC} vitals.vercel-insights.com *.usefathom.com *.ingest.sentry.io *.pusher.com wss://*.pusher.com vercel.live unpkg.com;
  default-src 'self' vitals.vercel-insights.com;
  font-src 'self' fonts.googleapis.com fonts.gstatic.com;
  form-action 'self';
  frame-ancestors 'self';
  frame-src 'self' *.onefootprint.com ${DEV_FRAME_SRC} vercel.live;
  img-src 'self' data: assets.vercel.com vercel.live vercel.com cdn.jsdelivr.net;
  media-src 'self' https;
  script-src 'self' 'unsafe-inline' 'unsafe-eval' *.usefathom.com vercel.live vitals.vercel-insights.com https://cdn.jsdelivr.net;
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
    key: 'Permissions-Policy',
    value:
      'camera=*, otp-credentials=*, publickey-credentials-get=*, clipboard-write=*',
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
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
  transpilePackages: [
    '@onefootprint/ui',
    '@onefootprint/design-tokens',
    '@onefootprint/icons',
    '@onefootprint/global-constants',
    '@onefootprint/hooks',
    '@onefootprint/request',
    '@onefootprint/types',
    '@radix-ui',
  ],
  async redirects() {
    return [
      {
        source: '/',
        destination: '/demo/acme-bank',
        permanent: true,
      },
      {
        source: '/acme-bank',
        destination: '/demo/acme-bank',
        permanent: true,
      },
      {
        source: '/demo',
        destination: '/demo/acme-bank',
        permanent: true,
      },
      {
        source: '/components',
        destination: '/components/all',
        permanent: true,
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

module.exports = IS_ANALYZE_ACTIVE
  ? require('@next/bundle-analyzer')({ enabled: true })(nextConfig)
  : nextConfig;
