// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';
import { COMMIT_SHA, SENTRY_DSN } from './src/config/constants';
import { IS_PROD } from '@onefootprint/global-constants';

if (SENTRY_DSN && IS_PROD) {
  Sentry.init({
    dsn: SENTRY_DSN,
    release: COMMIT_SHA,
    tracesSampleRate: 1,
    debug: false,
  });
}
