/** @type {import('next').NextConfig} */

const ContentSecurityPolicy = `
  child-src onefootprint.com;
  connect-src 'self' localhost:8000 *.onefootprint.com *.googleapis.com vitals.vercel-insights.com *.pusher.com wss://*.pusher.com vercel.live *.usefathom.com *.ingest.sentry.io; 
  default-src 'self' vitals.vercel-insights.com;
  font-src 'self' fonts.googleapis.com fonts.gstatic.com;
  form-action 'self';
  frame-ancestors 'self';
  frame-src 'self' vercel.live;
  img-src 'self' data: assets.vercel.com vercel.live vercel.com *.googleapis.com maps.gstatic.com;
  media-src 'self' https;
  script-src 'self' 'unsafe-inline' 'unsafe-eval' *.googleapis.com *.usefathom.com vercel.live vitals.vercel-insights.com;
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
  pageExtensions: ['page.tsx', 'page.ts', 'page.jsx', 'page.js'],
  reactStrictMode: false,
  compiler: {
    styledComponents: true,
  },
  experimental: {
    newNextLinkBehavior: true,
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
