import * as Sentry from '@sentry/nextjs';

import { COMMIT_SHA, SENTRY_DSN, VERCEL_ENV } from '../constants';

const configureSentry = () => {
  if (SENTRY_DSN && COMMIT_SHA) {
    Sentry.init({
      dsn: SENTRY_DSN,
      release: COMMIT_SHA,
      environment: VERCEL_ENV,
    });
  }
};

export default configureSentry;
