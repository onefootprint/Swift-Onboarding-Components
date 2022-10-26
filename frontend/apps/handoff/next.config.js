/** @type {import('next').NextConfig} */

module.exports = {
  pageExtensions: ['page.tsx', 'page.ts', 'page.jsx', 'page.js'],
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
  },
  experimental: {
    transpilePackages: [
      'footprint-elements',
      '@onefootprint/ui',
      '@onefootprint/design-tokens',
      '@onefootprint/icons',
      '@onefootprint/global-constants',
      '@onefootprint/icons',
      '@onefootprint/hooks',
      '@onefootprint/request',
      '@onefootprint/types',
    ],
  },
};
