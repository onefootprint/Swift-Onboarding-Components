/** @type {import('next').NextConfig} */
const { withSentryConfig } = require('@sentry/nextjs');
const withPlugins = require('next-compose-plugins');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
const withTM = require('next-transpile-modules')([
  'ui',
  'icons',
  'hooks',
  'request',
  'global-constants',
  'footprint',
  'footprint-provider',
  'themes',
]);

const nextConfig = {
  pageExtensions: ['page.tsx', 'page.ts', 'page.jsx', 'page.js'],
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
  },
};

const sentryOptions = {
  silent: true,
};

// Workaround https://github.com/cyrilwanner/next-compose-plugins/issues/50
module.exports = withSentryConfig(
  withPlugins([withTM, withBundleAnalyzer], nextConfig),
  sentryOptions,
);
