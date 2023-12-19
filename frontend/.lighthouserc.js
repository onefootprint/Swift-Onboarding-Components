/**
 * The configuration of this file focuses only on the production version of the URL "http://localhost:3002/demo/acme-bank".
 * We expose this URL to the Lighthouse CI
 */
module.exports = {
  ci: {
    upload: { target: 'temporary-public-storage' },
    collect: {
      numberOfRuns: 1, // default: 3
      settings: {
        preset: 'desktop',
        skipAudits: [],
        budgets: [
          {
            path: '/*',
            options: {},
            timings: /* milliseconds */ [
              { metric: 'interactive', budget: 1200 },
              { metric: 'first-meaningful-paint', budget: 1000 },
            ],
            resourceSizes: /* kibibytes (1 KiB = 1024 bytes) */ [
              { resourceType: 'total', budget: 576 }, //       549.9 KiB
              { resourceType: 'script', budget: 472 }, //      450.1 KiB
              { resourceType: 'font', budget: 51 }, //         50.7 KiB
              { resourceType: 'third-party', budget: 95 }, //  90.3 KiB
              { resourceType: 'document', budget: 9 }, //      7.0 KiB
              { resourceType: 'image', budget: 37 }, //        35.6 KiB
              { resourceType: 'stylesheet', budget: 7 }, //    6.3 KiB
              { resourceType: 'other', budget: 2 }, //         1.2 KiB
              { resourceType: 'media', budget: 1 }, //         0.0 KiB
            ],
            resourceCounts: [{ resourceType: 'third-party', budget: 7 }],
          },
        ],
      },
      startServerCommand:
        'yarn start --filter=bifrost  --filter=handoff --filter=demos',
      startServerReadyPattern: 'Ready in',
      url: ['http://localhost:3002'],
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'bf-cache': 'off', //                 There are always bf-cache failures when testing in headless. Reenable when headless can give us realistic bf-cache insights.
        'bootup-time': 'warn',
        'csp-xss': 'off', //                  Ensure CSP is effective against XSS attacks
        'dom-size': 'warn',
        'errors-in-console': 'warn',
        'html-has-lang': 'warn', //           `<html>` element does not have a `[lang]` attribute
        'installable-manifest': 'warn',
        'installable-manifest': 'warn', //    Web app manifest or service worker do not meet the installability requirements
        'landmark-one-main': 'warn',
        'legacy-javascript': 'warn',
        'mainthread-work-breakdown': 'warn',
        'maskable-icon': 'warn',
        'maskable-icon': 'warn', //           Manifest doesn't have a maskable icon
        'max-potential-fid': 'warn',
        'meta-description': 'warn', //        Document does not have a meta description
        'meta-viewport': 'warn', //           `[user-scalable="no"]` is used in the `<meta name="viewport">` element or the `[maximum-scale]` attribute is less than 5.
        'render-blocking-resource': 'warn',
        'server-response-time': 'warn',
        'service-worker': 'warn',
        'service-worker': 'warn', //          Does not register a service worker that controls page and `start_url`
        'splash-screen': 'warn', //           Is not configured for a custom splash screen
        'themed-omnibox': 'warn', //          Does not set a theme color for the address bar.
        'timing-budget': 'warn', //           Enable me, once we are stable
        'total-byte-weight': 'warn',
        'unused-javascript': 'warn', //       Reduce unused JavaScript
        'uses-long-cache-ttl': ['warn', { maxScore: 2 }],
        'uses-responsive-images': 'warn', //  Properly size images
        'uses-responsive-images': ['warn', { maxScore: 1 }],
        'valid-source-maps': 'warn',
        'valid-source-maps': 'warn', //       Missing source maps for large first-party JavaScript
        redirects: 'warn',
      },
    },
    server: {},
    wizard: {},
  },
};
