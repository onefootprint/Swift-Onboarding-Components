/** @type {import('next').NextConfig} */
const withPlugins = require('next-compose-plugins');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
const withTM = require('next-transpile-modules')(['icons']);

module.exports = withPlugins([withTM, withBundleAnalyzer], {
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
});
