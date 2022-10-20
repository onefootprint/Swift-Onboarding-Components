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

const ContentSecurityPolicy = `
  child-src onefootprint.com;
  connect-src 'self' vitals.vercel-insights.com *.pusher.com wss://*.pusher.com vercel.live usefathom.com *.usefathom.com *.ingest.sentry.io www.youtube.com js.driftt.com; 
  default-src 'self' vitals.vercel-insights.com;
  font-src 'self' fonts.googleapis.com fonts.gstatic.com;
  form-action 'self';
  frame-ancestors 'self';
  frame-src 'self' vercel.live www.youtube.com js.driftt.com form.typeform.com;
  img-src 'self' data: footprint-blog.ghost.io assets.vercel.com vercel.live vercel.com usefathom.com *.usefathom.com;
  media-src 'self' https;
  script-src 'self' 'unsafe-inline' 'unsafe-eval' js.driftt.com usefathom.com *.usefathom.com vercel.live vitals.vercel-insights.com tagmanager.google.com www.googletagmanager.com platform.twitter.com www.youtube.com static.ads-twitter.com connect.facebook.net www.facebook.com;
  style-src 'self' 'unsafe-inline' tagmanager.google.com fonts.googleapis.com;
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
  images: {
    domains: [
      'www.gravatar.com',
      'footprint-blog.ghost.io',
      'static.ghost.org',
    ],
  },
});
