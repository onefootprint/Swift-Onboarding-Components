/** @type {import('next').NextConfig} */
const withPlugins = require('next-compose-plugins');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

// TODO: Transpile
// https://linear.app/footprint/issue/FP-534/footprintjs-build
const withTM = require('next-transpile-modules')([
  'icons',
  'footprint-ui',
  'types',
]);

module.exports = withPlugins([withTM, withBundleAnalyzer], {
  pageExtensions: ['page.tsx', 'page.ts', 'page.jsx', 'page.js'],
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
  },
});
