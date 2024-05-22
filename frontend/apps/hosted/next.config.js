/** @type {import('next').NextConfig} */

const { withSentryConfig } = require('@sentry/nextjs');
const BundleAnalyzer = require('@next/bundle-analyzer');

const IS_DEV = process.env.NODE_ENV === 'development';
const COMMIT_SHA = process.env.VERCEL_GIT_COMMIT_SHA;
const SHOULD_UPLOAD_SOURCE_MAPS = false; // process.env.VERCEL_ENV === 'production' || process.env.VERCEL_ENV === 'preview';

const DATADOG_SRC = ['https://browser-intake-datadoghq.com'].join(' ');
const SENTRY_CONNECT_SRC = ['*.sentry.io', '*.ingest.sentry.io'].join(' ');
const SENTRY_SCRIPT_SRC = [
  'https://browser.sentry-cdn.com',
  'https://js.sentry-cdn.com',
].join(' ');

const IS_ANALYZE_ACTIVE = process.env.ANALYZE === 'true';
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

const DEV_CONNECT_SRC = (
  IS_DEV ? ['http://localhost:8000', 'http://127.0.0.1:8000'] : []
).join(' ');

const ContentSecurityPolicy = `
  child-src blob: onefootprint.com;
  connect-src 'self' ${DEV_CONNECT_SRC} *.neuro-id.com *.neuroid.cloud vitals.vercel-insights.com vercel.live *.onefootprint.com *.pusher.com wss://*.pusher.com dvnfo.com maps.googleapis.com unpkg.com https://*.fptls.com https://*.fptls2.com https://*.fptls3.com https://api.fpjs.io https://*.api.fpjs.io telemetry.stytch.com *.launchdarkly.com ${OBSERVE_CONNECT_SRC} ${LOG_ROCKET_CONNECT_SRC} ${SENTRY_CONNECT_SRC} ${DATADOG_SRC};
  default-src 'self' vitals.vercel-insights.com;
  font-src 'self' fonts.googleapis.com fonts.gstatic.com;
  form-action 'self';
  frame-src 'self' vercel.live;
  img-src 'self' data: assets.vercel.com vercel.live vercel.com i.onefp.net i-dev.onefp.net *.i-dev.onefp.net cdn.jsdelivr.net;
  media-src 'self' https;
  script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: vercel.live vitals.vercel-insights.com maps.googleapis.com fpnpmcdn.net js.dvnfo.com docs.opencv.org elements.stytch.com *.neuro-id.com https://cdn.jsdelivr.net ${LOG_ROCKET_SCRIPT_SRC} ${SENTRY_SCRIPT_SRC} ${DATADOG_SRC};
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
    value: 'camera=*, publickey-credentials-get=*, geolocation=*',
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
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.onefp.net',
      },
    ],
  },
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
            value:
              'public, maxage=1, s-maxage=1, stale-while-revalidate=59 must-revalidate',
          },
          {
            key: 'CDN-Cache-Control',
            value:
              'public, maxage=1, s-maxage=1, stale-while-revalidate=59 must-revalidate',
          },
          {
            key: 'Vercel-CDN-Cache-Control',
            value:
              'public, maxage=1, s-maxage=1, stale-while-revalidate=59 must-revalidate',
          },
        ],
      },
    ];
  },
  transpilePackages: [
    '@onefootprint/idv-elements',
    '@onefootprint/idv',
    '@onefootprint/ui',
    '@onefootprint/design-tokens',
    '@onefootprint/icons',
    '@onefootprint/hooks',
    '@onefootprint/request',
    '@onefootprint/types',
    '@onefootprint/global-constants',
    '@onefootprint/appearance',
    '@radix-ui/react-dialog',
  ],
  env: {
    CI: process.env.CI,
    IS_E2E: process.env.IS_E2E,
  },
};

module.exports = nextConfig;

if (SHOULD_UPLOAD_SOURCE_MAPS) {
  console.log('📦 Uploading source maps to Sentry');
  module.exports = withSentryConfig(
    module.exports,
    {
      // For all available options, see:
      // https://github.com/getsentry/sentry-webpack-plugin#options

      // Suppresses source map uploading logs during build
      silent: true,
      org: 'onefootprint',
      project: 'verify',
    },
    {
      // For all available options, see:
      // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
      release: COMMIT_SHA,
      transpileClientSDK: false,

      // Upload a larger set of source maps for prettier stack traces (increases build time)
      widenClientFileUpload: true,

      // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
      // This can increase your server load as well as your hosting bill.
      // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
      // side errors will fail.
      tunnelRoute: '/monitoring',

      // Hides source maps from generated client bundles
      hideSourceMaps: true,

      // Automatically tree-shake Sentry logger statements to reduce bundle size
      disableLogger: true,
    },
  );
}

if (IS_ANALYZE_ACTIVE) {
  console.log('📊 Showing bundle analyzer');
  module.exports = BundleAnalyzer({ enabled: true })(nextConfig);
}
