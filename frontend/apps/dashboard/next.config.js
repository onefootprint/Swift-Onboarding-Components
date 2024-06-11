const { withSentryConfig } = require('@sentry/nextjs');
const bundlerAnalyzer = require('@next/bundle-analyzer');

const IS_DEV = process.env.NODE_ENV === 'development';
const COMMIT_SHA = process.env.VERCEL_GIT_COMMIT_SHA;

const SHOULD_SHOW_ANALYZE = IS_DEV && process.env.ANALYZE === 'true';
const SHOULD_UPLOAD_SOURCE_MAPS = false; // process.env.VERCEL_ENV === 'production' || process.env.VERCEL_ENV === 'preview';

const getNextConfig = () => {
  const DATADOG_SRC = ['https://browser-intake-datadoghq.com'].join(' ');
  const SENTRY_CONNECT_SRC = ['*.sentry.io', '*.ingest.sentry.io'].join(' ');
  const SENTRY_SCRIPT_SRC = ['https://browser.sentry-cdn.com', 'https://js.sentry-cdn.com'].join(' ');
  const OBSERVE_CONNECT_SRC = ['189225732777.collect.observeinc.com'].join(' ');

  const DEV_CONNECT_SRC = (IS_DEV ? ['http://localhost:8000', 'http://127.0.0.1:8000'] : []).join(' ');

  const ContentSecurityPolicy = `
    child-src onefootprint.com;
    connect-src 'self' ${DEV_CONNECT_SRC} *.onefootprint.com unpkg.com *.googleapis.com vitals.vercel-insights.com *.pusher.com wss://*.pusher.com vercel.live *.launchdarkly.com ${SENTRY_CONNECT_SRC} ${OBSERVE_CONNECT_SRC} ${DATADOG_SRC} *.mapbox.com;
    default-src 'self' vitals.vercel-insights.com data:;
    font-src 'self' fonts.googleapis.com fonts.gstatic.com;
    form-action 'self';
    frame-ancestors 'self';
    frame-src 'self' vercel.live https://app.svix.com calendly.com data: blob:;
    img-src 'self' blob: data: assets.vercel.com vercel.live vercel.com *.googleapis.com maps.gstatic.com i.onefp.net i-dev.onefp.net *.i-dev.onefp.net assets.calendly.com cdn.jsdelivr.net;
    media-src 'self' https data:;
    script-src 'self' 'unsafe-inline' 'unsafe-eval' *.googleapis.com *.usefathom.com vercel.live vitals.vercel-insights.com cdn.vercel-insights.com ${SENTRY_SCRIPT_SRC} ${DATADOG_SRC};
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

  /** @type {import('next').NextConfig} */
  const defaultNextConfig = {
    pageExtensions: ['page.tsx', 'page.ts', 'page.jsx', 'page.js'],
    reactStrictMode: false,
    eslint: {
      ignoreDuringBuilds: true,
    },
    compiler: {
      styledComponents: true,
    },
    transpilePackages: [
      '@onefootprint/ui',
      '@onefootprint/design-tokens',
      '@onefootprint/icons',
      '@onefootprint/global-constants',
      '@onefootprint/hooks',
      '@onefootprint/request',
      '@onefootprint/types',
      '@onefootprint/dev-tools',
      '@radix-ui',
    ],
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
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'i.imgur.com',
        },
      ],
    },
  };

  if (SHOULD_SHOW_ANALYZE) {
    console.log('📊 Showing bundle analyzer');
    return bundlerAnalyzer({ enabled: true })(defaultNextConfig);
  }

  if (SHOULD_UPLOAD_SOURCE_MAPS) {
    console.log('📦 Uploading source maps to Sentry');
    return withSentryConfig(
      defaultNextConfig,
      {
        // For all available options, see:
        // https://github.com/getsentry/sentry-webpack-plugin#options

        // Suppresses source map uploading logs during build
        silent: true,
        org: 'onefootprint',
        project: 'dashboard',
      },
      {
        // For all available options, see:
        // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
        release: COMMIT_SHA,
        widenClientFileUpload: true,
        transpileClientSDK: false,
        tunnelRoute: '/monitoring',
        hideSourceMaps: true,
        disableLogger: true,
      },
    );
  }

  return defaultNextConfig;
};

module.exports = getNextConfig();
