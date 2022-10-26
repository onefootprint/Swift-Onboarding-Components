/** @type {import('next').NextConfig} */

module.exports = {
  pageExtensions: ['page.tsx', 'page.ts', 'page.jsx', 'page.js'],
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
  },
  images: {
    domains: ['footprint-blog.ghost.io', 'static.ghost.org'],
  },
  experimental: {
    transpilePackages: [
      '@onefootprint/ui',
      '@onefootprint/themes',
      '@onefootprint/icons',
      '@onefootprint/global-constants',
      '@onefootprint/icons',
      '@onefootprint/hooks',
      '@onefootprint/request',
      '@onefootprint/types',
    ],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/acme-bank',
        permanent: true,
      },
    ];
  },
};
