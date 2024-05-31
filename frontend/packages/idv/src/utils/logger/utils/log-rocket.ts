import * as LogRocket from 'logrocket';
// @ts-ignore
import * as setupLogRocketReact from 'logrocket-react';

import { BASE_URL_DOMAIN, COMMIT_SHA } from '../constants';
import type { ExtraProps } from '../types';

const LOG_ROCKET_ORG_ID = 'lrswdg/footprint-bifrost-prod';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const initLogRocket = (appName: string) => {
  LogRocket.init(LOG_ROCKET_ORG_ID, {
    release: COMMIT_SHA,
    rootHostname: BASE_URL_DOMAIN,
    dom: {
      inputSanitizer: true,
    },
    shouldDetectExceptions: true,
    network: {
      requestSanitizer: rawRequest => {
        // Don't log xhr requests, scripts, or data urls which are too large and irrelevant
        try {
          const { entryType, initiatorType, url } = rawRequest as any; // eslint-disable-line @typescript-eslint/no-explicit-any
          if (
            initiatorType === 'xmlhttprequest' ||
            initiatorType === 'script' ||
            url.startsWith('data:')
          ) {
            return null;
          }

          const isEmptyObject =
            typeof entryType === 'object' &&
            Object.keys(entryType).length === 0;
          if (entryType === 'resource' || isEmptyObject) {
            return null;
          }
        } catch {
          return null;
        }

        const request = { ...rawRequest };
        request.body = '<REDACTED>'; // Never log request bodies
        Object.keys(request.headers).forEach(headerName => {
          if (headerName.toLowerCase().includes('fp')) {
            // Redact all fp related headers
            request.headers[headerName] = '<REDACTED>';
          }
        });
        return request;
      },
      responseSanitizer: response => {
        // Only log unusual responses
        if (response.status === 200) {
          return null;
        }
        return response;
      },
    },
  });
  setupLogRocketReact(LogRocket);

  // Tie sentry issues to logrocket recordings
  // LogRocket.getSessionURL(sessionURL => {
  //   // const scope = Sentry.getCurrentScope();
  //   // scope.setExtra('LogRocketSessionURL', sessionURL);
  //   // scope.setExtra('appName', appName);
  // });
};

export const logRocketErrorEvent = (error: Error, extra?: ExtraProps) =>
  extra
    ? LogRocket.captureException(error, { extra })
    : LogRocket.captureException(error);

export const logRocketTrackEvent = (msg: string, extra: ExtraProps) =>
  LogRocket.track(msg, { level: 'track', ...extra });

export const logRocketWarnEvent = (msg: string, extra: ExtraProps) =>
  LogRocket.log(msg, { level: 'warn', ...extra });

export const logRocketInfoEvent = (msg: string, extra: ExtraProps) => {
  LogRocket.log(msg, { level: 'info', ...extra });
};

export default initLogRocket;
