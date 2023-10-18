/** @type {import('next').NextConfig} */

const IS_DEV = process.env.NODE_ENV === 'development';
const IS_ANALYZE_ACTIVE = process.env.ANALYZE === 'true';

const DevContentSecurityPolicy = `
  child-src onefootprint.com;
  connect-src 'self' http://localhost:8000 *.onefootprint.com unpkg.com *.googleapis.com vitals.vercel-insights.com *.pusher.com wss://*.pusher.com vercel.live *.ingest.sentry.io getform.io *.observeinc.com; 
  default-src 'self' vitals.vercel-insights.com;
  font-src 'self' fonts.googleapis.com fonts.gstatic.com;
  form-action 'self';
  frame-ancestors 'self';
  frame-src 'self' vercel.live https://app.svix.com calendly.com cdn.jsdelivr.net;
  img-src 'self' blob: data: assets.vercel.com vercel.live vercel.com *.googleapis.com maps.gstatic.com i.onefp.net i-dev.onefp.net *.i-dev.onefp.net assets.calendly.com;
  media-src 'self' https;
  script-src 'self' 'unsafe-inline' 'unsafe-eval' *.googleapis.com *.usefathom.com vercel.live vitals.vercel-insights.com cdn.vercel-insights.com;
  style-src 'self' 'unsafe-inline' fonts.googleapis.com cdn.jsdelivr.net;
  worker-src 'self' blob:;
`;

const ProdContentSecurityPolicy = `
  child-src onefootprint.com;
  connect-src 'self' *.onefootprint.com unpkg.com *.googleapis.com vitals.vercel-insights.com *.pusher.com wss://*.pusher.com vercel.live *.ingest.sentry.io *.observeinc.com; 
  default-src 'self' vitals.vercel-insights.com;
  font-src 'self' fonts.googleapis.com fonts.gstatic.com;
  form-action 'self';
  frame-ancestors 'self';
  frame-src 'self' vercel.live https://app.svix.com calendly.com;
  img-src 'self' blob: data: assets.vercel.com vercel.live vercel.com *.googleapis.com maps.gstatic.com i.onefp.net i-dev.onefp.net *.i-dev.onefp.net assets.calendly.com;
  media-src 'self' https;
  script-src 'self' 'unsafe-inline' 'unsafe-eval' *.googleapis.com *.usefathom.com vercel.live vitals.vercel-insights.com cdn.vercel-insights.com;
  style-src 'self' 'unsafe-inline' fonts.googleapis.com cdn.jsdelivr.net;
  worker-src 'self' blob:;
`;

const ContentSecurityPolicy = IS_DEV
  ? DevContentSecurityPolicy
  : ProdContentSecurityPolicy;

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
    value: 'camera=(), microphone=(), geolocation=()',
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
  transpilePackages: [
    '@onefootprint/ui',
    '@onefootprint/styled',
    '@onefootprint/design-tokens',
    '@onefootprint/icons',
    '@onefootprint/global-constants',
    '@onefootprint/hooks',
    '@onefootprint/request',
    '@onefootprint/types',
    '@onefootprint/dev-tools',
  ],
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/users',
        permanent: true,
      },
    ];
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

module.exports = IS_ANALYZE_ACTIVE
  ? require('@next/bundle-analyzer')({ enabled: true })(nextConfig)
  : nextConfig;
