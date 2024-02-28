/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n: {
    locales: ['en', 'es'],
    defaultLocale: 'en',
  },
  compiler: { styledComponents: true },
  eslint: { ignoreDuringBuilds: true },
  transpilePackages: [
    '@onefootprint/design-tokens',
    '@onefootprint/global-constants',
    '@onefootprint/hooks',
    '@onefootprint/icons',
    '@onefootprint/idv',
    '@onefootprint/request',
    '@onefootprint/styled',
    '@onefootprint/types',
    '@onefootprint/ui',
  ],
};

export default nextConfig;
