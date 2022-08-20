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
  'footprint',
  'footprint-ui',
  'footprint-provider',
  'themes',
]);

module.exports = withPlugins([withTM, withBundleAnalyzer], {
  productionBrowserSourceMaps: true,
  pageExtensions: ['page.tsx', 'page.ts', 'page.jsx', 'page.js'],
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
  },
});
