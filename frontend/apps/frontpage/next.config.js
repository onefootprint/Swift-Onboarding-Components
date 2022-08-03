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
  'global-constants',
  'themes',
]);

const withMDX = require('@next/mdx')({
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  extension: /\.mdx?$/,
  options: {
    providerImportSource: '@mdx-js/react',
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

module.exports = withPlugins([withTM, withMDX, withBundleAnalyzer], {
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
