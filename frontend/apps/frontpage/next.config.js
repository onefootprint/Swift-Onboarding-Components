/** @type {import('next').NextConfig} */
const withPlugins = require('next-compose-plugins');

const withMDX = require('@next/mdx')({
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  extension: /\.mdx?$/,
  options: {
    providerImportSource: '@mdx-js/react',
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

const IS_DEV = process.env.NODE_ENV === 'development';

const DEV_FRAME_SRC = (IS_DEV ? ['http://localhost:3000'] : []).join(' ');
const MARKETING_SOURCES = {
  connectSrc: [
    '*.aplo-evnt.com',
    '*.google-analytics.com',
    '*.google.com',
    '*.hsforms.com',
    '*.hsforms.net',
    '*.hubspot.com',
    '*.intercom.io',
    '*.nexus-websocket-a.intercom.io',
    '*.pagead.google.com',
    '*.unifyintent.com',
    '*.usefathom.com',
    'analytics.google.com',
    'api.hubapi.com',
    'aplo-evnt.com',
    'conversions-config.reddit.com',
    'forms.hscollectedforms.net',
    'pagead.google.com',
    'pixel-config.reddit.com',
    'px.ads.linkedin.com',
    'stats.g.doubleclick.net',
    'unifyintent.com',
    'wss://*.intercom.io',
    'wss://*.nexus-websocket-a.intercom.io',
    'www.google-analytics.com',
    'www.google.com',
    'www.redditstatic.com',
    'google.com',
  ],
  frameSrc: [
    '*.ads.linkedin.com',
    '*.doubleclick.com',
    '*.doubleclick.net',
    '*.googletagmanager.com',
    '*.hsforms.com',
    '*.hsforms.net',
    '*.unifyintent.com',
    '*.youtube.com',
  ],
  scriptsSrc: [
    '*.connect.facebook.net',
    '*.facebook.com',
    '*.google-analytics.com',
    '*.google.com',
    '*.googleads.g.doubleclick.net',
    '*.googleadservices.com',
    '*.googletagmanager.com',
    '*.hs-analytics.net',
    '*.hs-banner.com',
    '*.hs-scripts.com',
    '*.hsadspixel.net',
    '*.hscollectedforms.net',
    '*.hsforms.com',
    '*.hsforms.net',
    '*.hubspot.com',
    '*.intercom.io',
    '*.js.hs-scripts.com',
    '*.platform.twitter.com',
    '*.redditstatic.com',
    '*.static.ads-twitter.com',
    '*.tagmanager.google.com',
    '*.unifyintent.com',
    '*.usefathom.com',
    '*.vercel-scripts.com',
    '*.youtube.com',
    'googleads.g.doubleclick.net',
    'js.intercomcdn.com',
    'snap.licdn.com',
  ],
  domains: [
    '*.ads.linkedin.com',
    '*.google.com',
    '*.googleads.g.doubleclick.net',
    '*.googleadservices.com',
    '*.googletagmanager.com',
    '*.hsforms.com',
    '*.intercomassets.com',
    '*.intercomcdn.com',
    '*.unifyintent.com',
  ],
  fontSrc: ['*.intercomcdn.com', 'fonts.googleapis.com', 'fonts.gstatic.com'],
  imgSrc: [
    '*.google.com.br',
    '*.googleadservices.com',
    '*.googletagmanager.com',
    '*.usefathom.com',
    'alb.reddit.com',
    'footprint-blog.ghost.io',
    'forms-na1.hsforms.com',
    'forms.hsforms.com',
    'googleads.g.doubleclick.net',
    'perf-na1.hsforms.com',
    'px.ads.linkedin.com',
    'px4.ads.linkedin.com',
    'track.hubspot.com',
    'www.google.com',
  ],
  styleSrc: ['*.tagmanager.google.com', 'fonts.googleapis.com', 'cdn.jsdelivr.net'],
};

const marketingConnectSrc = MARKETING_SOURCES.connectSrc.join(' ');
const marketingFontSrc = MARKETING_SOURCES.fontSrc.join(' ');
const marketingFrameSrc = MARKETING_SOURCES.frameSrc.join(' ');
const marketingImgSrc = MARKETING_SOURCES.imgSrc.join(' ');
const marketingScriptsSrc = MARKETING_SOURCES.scriptsSrc.join(' ');
const marketingStyleSrc = MARKETING_SOURCES.styleSrc.join(' ');

const ContentSecurityPolicy = `
  child-src onefootprint.com;
  connect-src 'self' *.onefootprint.com vitals.vercel-insights.com api.onefootprint.com ${marketingConnectSrc};
  default-src 'self' vitals.vercel-insights.com;
  font-src 'self' ${marketingFontSrc};
  form-action 'self' *.hsforms.com *.hsforms.net;
  frame-ancestors 'self';
  frame-src 'self' ${DEV_FRAME_SRC} *.onefootprint.com ${marketingFrameSrc};
  img-src 'self' data: assets.vercel.com vercel.com i.onefp.net i-dev.onefp.net *.i-dev.onefp.net ${marketingImgSrc};
  media-src 'self' https footprint-blog.ghost.io;
  object-src 'self' data:;
  script-src 'self' 'unsafe-inline' 'unsafe-eval' *.vercel-scripts.com vitals.vercel-insights.com ${marketingScriptsSrc};
  style-src 'self' 'unsafe-inline' ${marketingStyleSrc};
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

module.exports = withPlugins([withMDX], {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
  pageExtensions: ['page.tsx', 'page.ts', 'page.jsx', 'page.js', 'page.mdx'],
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      {
        source: '/bloom-case-study',
        destination: '/customer-stories/bloom',
        permanent: true,
      },
    ];
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
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'gravatar.com',
      },
      {
        protocol: 'https',
        hostname: 'footprint-blog.ghost.io',
      },
      {
        protocol: 'https',
        hostname: 'static.ghost.org',
      },
      {
        protocol: 'https',
        hostname: 'i.onefp.net',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
});
