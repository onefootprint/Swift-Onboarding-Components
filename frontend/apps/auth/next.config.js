/** @type {import('next').NextConfig} */

const IS_DEV = process.env.NODE_ENV === 'development';
const IS_ANALYZE_ACTIVE = process.env.ANALYZE === 'true';
const DATADOG_SRC = [
  'https://browser-intake-datadoghq.com',
  'https://rum.browser-intake-datadoghq.com',
  'https://session-replay.browser-intake-datadoghq.com',
].join(' ');

const DEV_CONNECT_SRC = (IS_DEV ? ['http://localhost:8000', 'http://127.0.0.1:8000'] : []).join(' ');

const ContentSecurityPolicy = `
  child-src blob: onefootprint.com;
  connect-src 'self' ${DEV_CONNECT_SRC} vitals.vercel-insights.com vercel.live *.onefootprint.com maps.googleapis.com *.pusher.com wss://*.pusher.com ${DATADOG_SRC};
  default-src 'self' vitals.vercel-insights.com;
  font-src 'self' fonts.googleapis.com fonts.gstatic.com i.onefp.net;
  form-action 'self';
  frame-src 'self' vercel.live;
  img-src 'self' data: assets.vercel.com vercel.live vercel.com cdn.jsdelivr.net maps.googleapis.com *.onefp.net;
  media-src 'self' https;
  script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: vercel.live vitals.vercel-insights.com maps.googleapis.com ${DATADOG_SRC};
  style-src 'self' 'unsafe-inline' fonts.googleapis.com cdn.jsdelivr.net i.onefp.net;
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
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        source: '/locales/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, maxage=1, s-maxage=1, stale-while-revalidate=59 must-revalidate',
          },
          {
            key: 'CDN-Cache-Control',
            value: 'public, maxage=1, s-maxage=1, stale-while-revalidate=59 must-revalidate',
          },
          {
            key: 'Vercel-CDN-Cache-Control',
            value: 'public, maxage=1, s-maxage=1, stale-while-revalidate=59 must-revalidate',
          },
        ],
      },
    ];
  },

  compiler: { styledComponents: true },
  eslint: { ignoreDuringBuilds: true },
  env: {
    npm_package_name: process.env.npm_package_name,
  },
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '*.onefp.net' }],
  },
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

module.exports = IS_ANALYZE_ACTIVE ? require('@next/bundle-analyzer')({ enabled: true })(nextConfig) : nextConfig;
