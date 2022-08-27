/** @type {import('next').NextConfig} */

module.exports = {
  pageExtensions: ['page.tsx', 'page.ts', 'page.jsx', 'page.js'],
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/kyc-with-pii/getting-started',
        permanent: true,
      },
    ];
  },
};
