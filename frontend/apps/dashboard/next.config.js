/** @type {import('next').NextConfig} */

module.exports = {
  pageExtensions: ['page.tsx', 'page.ts', 'page.jsx', 'page.js'],
  reactStrictMode: false,
  compiler: {
    styledComponents: true,
  },
  experimental: {
    newNextLinkBehavior: true,
  },
};
