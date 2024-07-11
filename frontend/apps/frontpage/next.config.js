/** @type {import('next').NextConfig} */
const { execSync } = require('child_process');

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

const ContentSecurityPolicy = `
  child-src onefootprint.com;
  connect-src 'self' *.onefootprint.com vitals.vercel-insights.com getform.io/f/pbygomeb *.pusher.com wss://*.pusher.com vercel.live aplo-evnt.com usefathom.com *.usefathom.com www.youtube.com api.onefootprint.com unifyintent.com *.unifyintent.com px.ads.linkedin.com;
  default-src 'self' vitals.vercel-insights.com;
  font-src 'self' fonts.googleapis.com fonts.gstatic.com;
  form-action 'self';
  frame-ancestors 'self';
  frame-src 'self' ${DEV_FRAME_SRC} *.onefootprint.com vercel.live www.youtube.com form.typeform.com;
  img-src 'self' data: footprint-blog.ghost.io assets.vercel.com vercel.live vercel.com usefathom.com *.usefathom.com i.onefp.net i-dev.onefp.net *.i-dev.onefp.net unifyintent.com *.unifyintent.com cdn.jsdelivr.net px.ads.linkedin.com;
  media-src 'self' https footprint-blog.ghost.io;
  object-src 'self' data:;
  script-src 'self' 'unsafe-inline' 'unsafe-eval' usefathom.com *.usefathom.com vercel.live vitals.vercel-insights.com tagmanager.google.com www.googletagmanager.com platform.twitter.com www.youtube.com static.ads-twitter.com connect.facebook.net www.facebook.com unifyintent.com *.unifyintent.com *.apollo.io *.vercel-scripts.com snap.licdn.com googleads.g.doubleclick.net www.googleadservices.com;
  style-src 'self' 'unsafe-inline' tagmanager.google.com fonts.googleapis.com cdn.jsdelivr.net;
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
        hostname: 'i.onefp.net',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
});
