/** @type {import('next').NextConfig} */

const ContentSecurityPolicy = `
  child-src onefootprint.com;
  connect-src 'self' *.onefootprint.com http://localhost:8000 vitals.vercel-insights.com *.usefathom.com *.ingest.sentry.io *.pusher.com wss://*.pusher.com vercel.live unpkg.com; 
  default-src 'self' vitals.vercel-insights.com;
  font-src 'self' fonts.googleapis.com fonts.gstatic.com;
  form-action 'self';
  frame-ancestors 'self';
  frame-src 'self' *.onefootprint.com http://localhost:3000 http://localhost:3010 vercel.live;
  img-src 'self' data: assets.vercel.com vercel.live footprint-blog.ghost.io vercel.com;
  media-src 'self' https;
  script-src 'self' 'unsafe-inline' 'unsafe-eval' *.usefathom.com vercel.live vitals.vercel-insights.com;
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
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'static.ghost.org',
      },
      {
        protocol: 'https',
        hostname: 'footprint-blog.ghost.io',
      },
    ],
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

module.exports = nextConfig;
