// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
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
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    integrations: [new Sentry.Replay()],
  });
}
