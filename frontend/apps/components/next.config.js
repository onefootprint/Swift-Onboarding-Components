/** @type {import('next').NextConfig} */

const IS_ANALYZE_ACTIVE = process.env.ANALYZE === 'true';
const IS_OUTPUT_STANDALONE = process.env.NEXT_BUILD_ENV_OUTPUT === 'standalone';

const ContentSecurityPolicy = `
  child-src onefootprint.com;
  connect-src 'self' localhost:8000 vitals.vercel-insights.com vercel.live *.ingest.sentry.io *.onefootprint.com maps.googleapis.com *.pusher.com wss://*.pusher.com 189225732777.collect.observeinc.com; 
  default-src 'self' vitals.vercel-insights.com;
  font-src 'self' fonts.googleapis.com fonts.gstatic.com;
  form-action 'self';
  frame-src 'self' vercel.live;
  img-src 'self' data: assets.vercel.com vercel.live vercel.com cdn.jsdelivr.net maps.googleapis.com;
  media-src 'self' https;
  script-src 'self' 'unsafe-inline' 'unsafe-eval' vercel.live vitals.vercel-insights.com maps.googleapis.com;
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
  productionBrowserSourceMaps: true,
  pageExtensions: ['page.tsx', 'page.ts', 'page.jsx', 'page.js'],
  reactStrictMode: false,
  compiler: {
    styledComponents: true,
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
    '@onefootprint/styled',
    '@onefootprint/design-tokens',
    '@onefootprint/icons',
    '@onefootprint/global-constants',
    '@onefootprint/hooks',
    '@onefootprint/request',
    '@onefootprint/types',
    '@onefootprint/appearance',
  ],
};

if (IS_OUTPUT_STANDALONE) {
  nextConfig.output = 'standalone';
}

module.exports = IS_ANALYZE_ACTIVE
  ? require('@next/bundle-analyzer')({ enabled: true })(nextConfig)
  : nextConfig;
