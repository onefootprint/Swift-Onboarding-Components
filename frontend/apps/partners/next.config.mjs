import bundlerAnalyzer from '@next/bundle-analyzer';

/** @type {import('next').NextConfig} */

const IS_DEV = process.env.NODE_ENV === 'development';
const IS_ANALYZE_ACTIVE = process.env.ANALYZE === 'true';

const DEV_CONNECT_SRC = (IS_DEV ? ['http://localhost:8000', 'http://127.0.0.1:8000'] : []).join(' ');

const ContentSecurityPolicy = `
  child-src blob: onefootprint.com;
  connect-src 'self' ${DEV_CONNECT_SRC} vitals.vercel-insights.com vercel.live *.onefootprint.com maps.googleapis.com *.pusher.com wss://*.pusher.com;
  default-src 'self' vitals.vercel-insights.com;
  font-src 'self' fonts.googleapis.com fonts.gstatic.com;
  form-action 'self';
  frame-src 'self' vercel.live data: blob:;
  img-src 'self' data: blob: assets.vercel.com vercel.live vercel.com cdn.jsdelivr.net maps.googleapis.com i-dev.onefp.net *.i-dev.onefp.net;
  media-src 'self' https;
  script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: vercel.live vitals.vercel-insights.com maps.googleapis.com;
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
    '@radix-ui',
  ],
};

export default IS_ANALYZE_ACTIVE ? bundlerAnalyzer({ enabled: true })(nextConfig) : nextConfig;
