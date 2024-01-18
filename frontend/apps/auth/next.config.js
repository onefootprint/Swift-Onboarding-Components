/** @type {import('next').NextConfig} */

const IS_ANALYZE_ACTIVE = process.env.ANALYZE === 'true';

const SENTRY_CONNECT_SRC = ['*.sentry.io', '*.ingest.sentry.io'].join(' ');
const SENTRY_SCRIPT_SRC = [
  'https://browser.sentry-cdn.com',
  'https://js.sentry-cdn.com',
].join(' ');

const OBSERVE_CONNECT_SRC = ['189225732777.collect.observeinc.com'].join(' ');

const LOG_ROCKET_SCRIPT_SRC = [
  'https://cdn.logrocket.io',
  'https://cdn.lr-ingest.io',
  'https://cdn.lr-in.com',
  'https://cdn.lr-in-prod.com',
  'https://cdn.lr-ingest.com',
  'https://cdn.ingest-lr.com',
  'https://cdn.lr-intake.com',
  'https://cdn.intake-lr.com',
].join(' ');

const LOG_ROCKET_CONNECT_SRC = [
  'https://*.logrocket.io',
  'https://*.lr-ingest.io',
  'https://*.logrocket.com',
  'https://*.lr-in.com',
  'https://*.lr-in-prod.com',
  'https://*.lr-ingest.com',
  'https://*.ingest-lr.com',
  'https://*.lr-intake.com',
  'https://*.intake-lr.com',
].join(' ');

const ContentSecurityPolicy = `
  child-src blob: onefootprint.com;
  connect-src 'self' localhost:8000 vitals.vercel-insights.com vercel.live *.onefootprint.com maps.googleapis.com *.pusher.com wss://*.pusher.com ${OBSERVE_CONNECT_SRC} ${LOG_ROCKET_CONNECT_SRC} ${SENTRY_CONNECT_SRC}; 
  default-src 'self' vitals.vercel-insights.com;
  font-src 'self' fonts.googleapis.com fonts.gstatic.com;
  form-action 'self';
  frame-src 'self' vercel.live;
  img-src 'self' data: assets.vercel.com vercel.live vercel.com cdn.jsdelivr.net maps.googleapis.com;
  media-src 'self' https;
  script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: vercel.live vitals.vercel-insights.com maps.googleapis.com ${LOG_ROCKET_SCRIPT_SRC} ${SENTRY_SCRIPT_SRC};
  style-src 'self' 'unsafe-inline' fonts.googleapis.com cdn.jsdelivr.net;
  worker-src 'self' blob:;
`;

const securityHeaders = [
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload',
  },
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim(),
  },
];

const nextConfig = {
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },

  compiler: { styledComponents: true },
  eslint: { ignoreDuringBuilds: true },
  transpilePackages: [
    '@onefootprint/design-tokens',
    '@onefootprint/global-constants',
    '@onefootprint/hooks',
    '@onefootprint/icons',
    '@onefootprint/idv',
    '@onefootprint/request',
    '@onefootprint/styled',
    '@onefootprint/types',
    '@onefootprint/ui',
  ],
};

module.exports = IS_ANALYZE_ACTIVE
  ? require('@next/bundle-analyzer')({ enabled: true })(nextConfig)
  : nextConfig;
