/** @type {import('next').NextConfig} */
const withPlugins = require('next-compose-plugins');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
const withTM = require('next-transpile-modules')([
  'ui',
  'icons',
  'hooks',
  'request',
  'themes',
]);

module.exports = withPlugins([withTM, withBundleAnalyzer], {
  pageExtensions: ['page.tsx', 'page.ts', 'page.jsx', 'page.js'],
  reactStrictMode: false,
  compiler: {
    styledComponents: true,
  },
});
