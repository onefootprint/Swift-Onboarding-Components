/** @type {import('next').NextConfig} */
const nextConfig = {
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
    '@radix-ui',
  ],
};

export default nextConfig;
