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
