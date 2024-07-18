/** @type {import('next').NextConfig} */

const ContentSecurityPolicy = `
  child-src onefootprint.com;
  connect-src 'self' *.onefootprint.com vitals.vercel-insights.com *.pusher.com wss://*.pusher.com vercel.live *.usefathom.com; 
  default-src 'self' vitals.vercel-insights.com;
  font-src 'self' fonts.googleapis.com fonts.gstatic.com;
  form-action 'self';
  frame-ancestors 'self';
  frame-src 'self' vercel.live;
  img-src 'self' data: assets.vercel.com vercel.live vercel.com cdn.jsdelivr.net;
  media-src 'self' https;
  script-src 'self' 'unsafe-inline' 'unsafe-eval' *.usefathom.com vercel.live vitals.vercel-insights.com;
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

module.exports = {
  productionBrowserSourceMaps: true,
  pageExtensions: ['page.tsx', 'page.ts', 'page.jsx', 'page.js'],
  reactStrictMode: true,
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
    '@onefootprint/ui',
    '@onefootprint/design-tokens',
    '@onefootprint/icons',
    '@onefootprint/global-constants',
    '@onefootprint/hooks',
    '@onefootprint/request',
    '@onefootprint/types',
    '@radix-ui',
  ],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
