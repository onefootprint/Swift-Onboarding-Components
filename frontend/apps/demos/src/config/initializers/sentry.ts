import * as Sentry from '@sentry/nextjs';

import { COMMIT_SHA, SENTRY_DSN } from '../constants';

const configureSentry = () => {
  if (SENTRY_DSN) {
    Sentry.init({
      dsn: SENTRY_DSN,
      release: COMMIT_SHA,
    });
  }
};

export default configureSentry;
