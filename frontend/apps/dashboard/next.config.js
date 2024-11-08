const bundlerAnalyzer = require('@next/bundle-analyzer');

const IS_DEV = process.env.NODE_ENV === 'development';

const SHOULD_SHOW_ANALYZE = IS_DEV && process.env.ANALYZE === 'true';

const getNextConfig = () => {
  const DATADOG_SRC = [
    'https://browser-intake-datadoghq.com',
    'https://rum.browser-intake-datadoghq.com',
    'https://session-replay.browser-intake-datadoghq.com',
  ].join(' ');

  const DEV_CONNECT_SRC = (IS_DEV ? ['http://localhost:8000', 'http://127.0.0.1:8000'] : []).join(' ');

  const ContentSecurityPolicy = {
    'child-src': 'onefootprint.com',
    'connect-src': `'self' ${DEV_CONNECT_SRC} ${DATADOG_SRC} *.onefootprint.com unpkg.com *.googleapis.com vitals.vercel-insights.com *.pusher.com wss://*.pusher.com vercel.live *.launchdarkly.com *.mapbox.com *.ghost.io`,
    'default-src': `'self' vitals.vercel-insights.com data:`,
    'font-src': `'self' fonts.googleapis.com fonts.gstatic.com`,
    'form-action': `'self'`,
    'frame-ancestors': `'self'`,
    'frame-src': `'self' vercel.live https://app.svix.com calendly.com data: blob:`,
    'img-src': `'self' blob: data: assets.vercel.com vercel.live vercel.com *.googleapis.com maps.gstatic.com i.onefp.net i-dev.onefp.net *.i-dev.onefp.net assets.calendly.com cdn.jsdelivr.net *.ghost.io *.ggpht.com`,
    'media-src': `'self' https data:`,
    'script-src': `'self' 'unsafe-inline' 'unsafe-eval' ${DATADOG_SRC} *.googleapis.com *.usefathom.com vercel.live vitals.vercel-insights.com cdn.vercel-insights.com`,
    'style-src': `'self' 'unsafe-inline' fonts.googleapis.com cdn.jsdelivr.net`,
    'worker-src': `'self' blob:`,
  };

  const ContentSecurityPolicyOnlyForOnboarding = {
    'connect-src': '*.google.com *.googletagmanager.com *.hsforms.com api.hsforms.com',
    'frame-src': '*.doubleclick.net *.googletagmanager.com',
    'img-src': '*.doubleclick.net *.google.com.br *.google.com',
    'script-src': '*.doubleclick.net *.google.com *.googletagmanager.com',
  };

  const securityHeaders = [
    {
      key: 'X-DNS-Prefetch-Control',
      value: 'on',
    },
    {
      key: 'Strict-Transport-Security',
      value: 'max-age=31536000; includeSubDomains; preload',
    },
    {
      key: 'X-XSS-Protection',
      value: '1; mode=block',
    },
    {
      key: 'X-Frame-Options',
      value: 'SAMEORIGIN',
    },
    {
      key: 'Permissions-Policy',
      value: 'camera=(), microphone=(), geolocation=()',
    },
    {
      key: 'X-Content-Type-Options',
      value: 'nosniff',
    },
    {
      key: 'Referrer-Policy',
      value: 'strict-origin-when-cross-origin',
    },
    {
      key: 'Content-Security-Policy',
      value: formatContentSecurityPolicy(ContentSecurityPolicy),
    },
  ];

  /** @type {import('next').NextConfig} */
  const defaultNextConfig = {
    pageExtensions: ['page.tsx', 'page.ts', 'page.jsx', 'page.js'],
    reactStrictMode: false,
    eslint: {
      ignoreDuringBuilds: true,
    },
    compiler: {
      styledComponents: true,
    },
    transpilePackages: [
      '@onefootprint/ui',
      '@onefootprint/design-tokens',
      '@onefootprint/icons',
      '@onefootprint/global-constants',
      '@onefootprint/hooks',
      '@onefootprint/request',
      '@onefootprint/types',
      '@radix-ui',
    ],
    async redirects() {
      return [
        {
          source: '/',
          destination: '/users',
          permanent: true,
        },
      ];
    },
    async headers() {
      return [
        /**
         * * 1. Default routes ('/:path*'):
         *    - Uses strict security headers that block external tracking and analytics
         *    - Provides maximum security for authenticated user sessions
         */
        {
          source: '/:path*',
          headers: securityHeaders,
        },
        /**
         * This separation ensures we only allow tracking where absolutely necessary
         * * 2. Onboarding routes ('/onboarding/:path*'):
         *    - Includes additional CSP directives to allow Google Analytics/Tag Manager
         *    - Relaxed specifically for onboarding to track conversion metrics
         *    - Limited to unauthenticated user flows only
         */
        {
          source: '/onboarding/:path*',
          headers: [
            ...securityHeaders.filter(header => header.key !== 'Content-Security-Policy'),
            {
              key: 'Content-Security-Policy',
              value: getMergedContentSecurityPolicy(ContentSecurityPolicy, ContentSecurityPolicyOnlyForOnboarding),
            },
          ],
        },
      ];
    },
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'i.imgur.com',
        },
        {
          protocol: 'https',
          hostname: 'i-dev.onefp.net',
        },
        {
          protocol: 'https',
          hostname: '*.i-dev.onefp.net',
        },
        {
          protocol: 'https',
          hostname: 'i.onefp.net',
        },
        {
          protocol: 'https',
          hostname: 'local.i-dev.onefp.net',
        },
        {
          protocol: 'https',
          hostname: '*.ghost.io',
        },
      ],
    },
  };

  if (SHOULD_SHOW_ANALYZE) {
    console.log('📊 Showing bundle analyzer');
    return bundlerAnalyzer({ enabled: true })(defaultNextConfig);
  }

  return defaultNextConfig;
};

/**
 * Formats a Content Security Policy (CSP) object into a valid CSP string
 * @param {Object.<string, string>} cspObject - An object containing CSP directive-value pairs
 * @returns {string} A formatted CSP string with directives and values
 *
 * @example
 * const csp = { 'script-src': "'self'", 'img-src': "example.com" };
 * // Returns: "script-src 'self'; img-src example.com"
 */
const formatContentSecurityPolicy = cspObject => {
  const TWO_OR_MORE_SPACES_REGEX = /\s{2,}/g;
  return Object.entries(cspObject)
    .map(([key, value]) => `${key} ${value}`)
    .join('; ')
    .replace(TWO_OR_MORE_SPACES_REGEX, ' ')
    .trim();
};

/**
 * Merges two Content Security Policy (CSP) objects and formats the result as a CSP string
 * @param {Object.<string, string>} baseCSP - The base CSP object containing directive-value pairs
 * @param {Object.<string, string>} extraCSP - Additional CSP object to merge with the base
 * @returns {string} A formatted CSP string with merged directives
 *
 * @example
 * const base = { 'script-src': "'self'", 'img-src': "example.com" };
 * const extra = { 'script-src': "trusted.com", 'connect-src': "api.com" };
 * // Returns: "script-src 'self' trusted.com; img-src example.com; connect-src api.com"
 */
const getMergedContentSecurityPolicy = (baseCSP, extraCSP) => {
  const mergedCSP = { ...baseCSP };
  for (const [key, value] of Object.entries(extraCSP)) {
    if (mergedCSP[key]) {
      const allValues = new Set([...mergedCSP[key].split(' '), ...value.split(' ')]);
      mergedCSP[key] = Array.from(allValues).filter(Boolean).join(' ');
    } else {
      mergedCSP[key] = value;
    }
  }

  return formatContentSecurityPolicy(mergedCSP);
};

module.exports = getNextConfig();
