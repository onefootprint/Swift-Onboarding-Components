import { getSessionId } from '@onefootprint/dev-tools';
import * as Sentry from '@sentry/nextjs';
import * as LogRocket from 'logrocket';

import { COMMIT_SHA, SENTRY_DSN, VERCEL_ENV } from '../constants';

const configureSentry = (appName: string) => {
  Sentry.init({
    dsn: SENTRY_DSN,
    release: COMMIT_SHA,
    environment: VERCEL_ENV,

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,

    beforeSend(rawEvent) {
      const event = { ...rawEvent };
      if (!event.extra) {
        event.extra = {};
      }
      // Inject the LogRocket session URL into Sentry events
      const logRocketSession = LogRocket.sessionURL;
      if (logRocketSession) {
        event.extra.LogRocket = logRocketSession;
      }
      event.extra.appName = appName;
      event.extra.sessionId = getSessionId();
      return event;
    },
  });
};

export default configureSentry;
