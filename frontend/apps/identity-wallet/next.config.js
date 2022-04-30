/** @type {import('next').NextConfig} */
const withTM = require('next-transpile-modules')(['ui', 'icons', 'styled']);

module.exports = withTM({
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
  },
});
