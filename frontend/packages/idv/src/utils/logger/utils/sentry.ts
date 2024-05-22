// import { getSessionId } from '@onefootprint/dev-tools';
// import * as Sentry from '@sentry/nextjs';
// import * as LogRocket from 'logrocket';

// import { COMMIT_SHA, SENTRY_DSN, VERCEL_ENV } from '../constants';
// import type { ExtraProps } from '../types';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const initSentry = (appName: string) => {
  // Sentry.init({
  //   dsn: SENTRY_DSN,
  //   release: COMMIT_SHA,
  //   environment: VERCEL_ENV,
  //   // Setting this option to true will print useful information to the console while you're setting up Sentry.
  //   debug: false,
  //   beforeSend(rawEvent) {
  //     const event = { ...rawEvent };
  //     if (!event.extra) {
  //       event.extra = {};
  //     }
  //     // Inject the LogRocket session URL into Sentry events
  //     const logRocketSession = LogRocket.sessionURL;
  //     if (logRocketSession) {
  //       event.extra.LogRocket = logRocketSession;
  //     }
  //     event.extra.appName = appName;
  //     event.extra.sessionId = getSessionId();
  //     return event;
  //   },
  // });
};

// export const sentryErrorEvent = (error: Error | string, extra?: ExtraProps) =>
//   Sentry.captureException(error, extra);

// export const sentryTrackEvent = (msg: string, extra: ExtraProps) => {
//   // The breadcrumbs will be included with future exceptions sent to Sentry
//   Sentry.addBreadcrumb({
//     type: 'track',
//     message: msg,
//     data: extra,
//     // Sentry.io expects a string here even though the SDK type is number
//     timestamp: new Date().toISOString() as unknown as number,
//   });
// };

// export const sentryWarnEvent = (msg: string, extra: ExtraProps) =>
//   Sentry.captureMessage(msg, { level: 'warning', extra });

// export const sentryInfoEvent = (msg: string, extra: ExtraProps) =>
//   Sentry.captureMessage(msg, { level: 'info', extra });

export default initSentry;
