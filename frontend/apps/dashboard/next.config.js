const bundlerAnalyzer = require('@next/bundle-analyzer');

const IS_DEV = process.env.NODE_ENV === 'development';

const SHOULD_SHOW_ANALYZE = IS_DEV && process.env.ANALYZE === 'true';

const DEV_CONNECT_SRC = (IS_DEV ? ['http://localhost:8000', 'http://127.0.0.1:8000'] : []).join(' ');

const cspHeader = `
  child-src onefootprint.com;
  connect-src 'self' ${DEV_CONNECT_SRC} https://browser-intake-datadoghq.com https://rum.browser-intake-datadoghq.com https://session-replay.browser-intake-datadoghq.com *.onefootprint.com unpkg.com *.googleapis.com vitals.vercel-insights.com *.pusher.com wss://*.pusher.com vercel.live *.launchdarkly.com *.mapbox.com *.ghost.io *.google.com *.googletagmanager.com *.hsforms.com api.hsforms.com;
  default-src 'self' vitals.vercel-insights.com data:;
  font-src 'self' fonts.googleapis.com fonts.gstatic.com;
  form-action 'self';
  frame-ancestors 'self';
  frame-src 'self' vercel.live https://app.svix.com calendly.com data: blob: *.doubleclick.net *.googletagmanager.com;
  img-src 'self' blob: data: assets.vercel.com vercel.live vercel.com *.googleapis.com maps.gstatic.com i.onefp.net i-dev.onefp.net *.i-dev.onefp.net assets.calendly.com cdn.jsdelivr.net *.ghost.io *.ggpht.com *.doubleclick.net *.google.com.br *.google.com;
  media-src 'self' https data:;
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://browser-intake-datadoghq.com https://rum.browser-intake-datadoghq.com https://session-replay.browser-intake-datadoghq.com *.googleapis.com *.usefathom.com vercel.live vitals.vercel-insights.com cdn.vercel-insights.com *.doubleclick.net *.google.com *.googletagmanager.com *.google-analytics.com www.googleadservices.com;
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
    value: cspHeader.replace(/\s{2,}/g, ' ').trim(),
  },
];

/** @type {import('next').NextConfig} */
const defaultNextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
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
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
      },
      {
        protocol: 'https',
        hostname: 'i-dev.onefp.net',
      },
      {
        protocol: 'https',
        hostname: '*.i-dev.onefp.net',
      },
      {
        protocol: 'https',
        hostname: 'i.onefp.net',
      },
      {
        protocol: 'https',
        hostname: 'local.i-dev.onefp.net',
      },
      {
        protocol: 'https',
        hostname: '*.ghost.io',
      },
    ],
  },
};

const config = SHOULD_SHOW_ANALYZE ? bundlerAnalyzer({ enabled: true })(defaultNextConfig) : defaultNextConfig;

module.exports = config;
