const withTM = require('next-transpile-modules')(['ui', 'icons', 'styled']);

module.exports = withTM({
  pageExtensions: ['page.tsx', 'page.ts', 'page.jsx', 'page.js'],
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
  },
});
