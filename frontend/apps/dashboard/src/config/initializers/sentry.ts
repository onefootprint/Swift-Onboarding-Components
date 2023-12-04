import { IS_PROD } from '@onefootprint/global-constants';
import * as Sentry from '@sentry/nextjs';

import { COMMIT_SHA, SENTRY_DSN } from '../constants';

const configureSentry = () => {
  if (SENTRY_DSN && IS_PROD) {
    Sentry.init({
      dsn: SENTRY_DSN,
      release: COMMIT_SHA,
    });
  }
};

export default configureSentry;
