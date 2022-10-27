/** @type {import('next').NextConfig} */

const ContentSecurityPolicy = `
  child-src onefootprint.com;
  connect-src 'self' vitals.vercel-insights.com *.ingest.sentry.io *.onefootprint.com vercel.live *.pusher.com wss://*.pusher.com;
  default-src 'self' vitals.vercel-insights.com;
  font-src 'self' fonts.googleapis.com fonts.gstatic.com;
  form-action 'self';
  frame-ancestors 'self';
  frame-src 'self' vercel.live;
  img-src 'self' data: assets.vercel.com vercel.live vercel.com;
  media-src 'self' https;
  script-src 'self' 'unsafe-inline' 'unsafe-eval' vercel.live vitals.vercel-insights.com;
  style-src 'self' 'unsafe-inline' fonts.googleapis.com;
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
    value: 'camera=(), geolocation=()',
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

module.exports = {
  pageExtensions: ['page.tsx', 'page.ts', 'page.jsx', 'page.js'],
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
  },
  experimental: {
    transpilePackages: [
      'footprint-elements',
      '@onefootprint/ui',
      '@onefootprint/design-tokens',
      '@onefootprint/icons',
      '@onefootprint/global-constants',
      '@onefootprint/icons',
      '@onefootprint/hooks',
      '@onefootprint/request',
      '@onefootprint/types',
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
