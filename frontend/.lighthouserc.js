/**
 * The configuration of this file focuses only on the production version of the URL "http://localhost:3002/demo/acme-bank".
 * We expose this URL to the Lighthouse CI
 */
module.exports = {
  ci: {
    upload: { target: 'temporary-public-storage' },
    collect: {
      numberOfRuns: 2, // default: 3
      settings: {
        preset: 'desktop',
        skipAudits: [],
        budgets: [
          {
            path: '/*',
            options: {},
            timings: /* milliseconds */ [
              { metric: 'interactive', budget: 1000 },
              { metric: 'first-meaningful-paint', budget: 1000 },
            ],
            resourceSizes: /* kibibytes (1 KiB = 1024 bytes) */ [
              { resourceType: 'total', budget: 769 }, //       737.3 KiB
              { resourceType: 'script', budget: 700 }, //      669.0 KiB
              { resourceType: 'font', budget: 51 }, //         50.7 KiB
              { resourceType: 'third-party', budget: 58 }, //  57.8 KiB
              { resourceType: 'document', budget: 8 }, //      7.2 KiB
              { resourceType: 'image', budget: 6 }, //         5.5 KiB
              { resourceType: 'stylesheet', budget: 4 }, //    3.8 KiB
              { resourceType: 'other', budget: 2 }, //         1.2 KiB
              { resourceType: 'media', budget: 1 }, //         0.0 KiB
            ],
            resourceCounts: [{ resourceType: 'third-party', budget: 5 }],
          },
        ],
      },
      startServerCommand:
        'yarn start --filter=bifrost  --filter=handoff --filter=demos',
      startServerReadyPattern: 'ready started server on 0.0.0.0:3002',
      url: ['http://localhost:3002'],
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'bf-cache': 'off', //                 There are always bf-cache failures when testing in headless. Reenable when headless can give us realistic bf-cache insights.
        'csp-xss': 'off', //                  Ensure CSP is effective against XSS attacks
        'html-has-lang': 'warn', //           `<html>` element does not have a `[lang]` attribute
        'installable-manifest': 'warn', //    Web app manifest or service worker do not meet the installability requirements
        'maskable-icon': 'warn', //           Manifest doesn't have a maskable icon
        'meta-description': 'warn', //        Document does not have a meta description
        'meta-viewport': 'warn', //           `[user-scalable="no"]` is used in the `<meta name="viewport">` element or the `[maximum-scale]` attribute is less than 5.
        'service-worker': 'warn', //          Does not register a service worker that controls page and `start_url`
        'splash-screen': 'warn', //           Is not configured for a custom splash screen
        'themed-omnibox': 'warn', //          Does not set a theme color for the address bar.
        'timing-budget': 'warn', //           ...
        'unused-javascript': 'warn', //       Reduce unused JavaScript
        'uses-responsive-images': 'warn', //  Properly size images
        'valid-source-maps': 'warn', //       Missing source maps for large first-party JavaScript
      },
    },
    server: {},
    wizard: {},
  },
};
