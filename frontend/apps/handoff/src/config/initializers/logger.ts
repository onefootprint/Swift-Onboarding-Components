import { getSessionId } from '@onefootprint/dev-tools';
import { IS_BROWSER, IS_PROD } from '@onefootprint/global-constants';
import type { DeviceInfo } from '@onefootprint/idv-elements';
import { checkDeviceInfo } from '@onefootprint/idv-elements';
import * as Sentry from '@sentry/nextjs';
import * as LogRocket from 'logrocket';
// @ts-ignore
import * as setupLogRocketReact from 'logrocket-react';

import { COMMIT_SHA, SENTRY_DSN, VERCEL_ENV } from '../constants';

const BASE_URL_DOMAIN = 'onefootprint.com';
const LOG_ROCKET_ORG_ID = 'lrswdg/footprint-bifrost-prod';

export const configureLogRocket = () => {
  if (IS_PROD && IS_BROWSER) {
    LogRocket.init(LOG_ROCKET_ORG_ID, {
      release: COMMIT_SHA,
      rootHostname: BASE_URL_DOMAIN,
      dom: {
        inputSanitizer: true,
      },
      network: {
        requestSanitizer: rawRequest => {
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
    // Log the context of the user
    const sessionId = getSessionId();
    checkDeviceInfo().then((deviceInfo: DeviceInfo) => {
      LogRocket.identify(sessionId, {
        app: 'handoff',
        handoffSessionId: sessionId,
        deviceType: deviceInfo.type,
        deviceHasSupportForWebauthn: deviceInfo.hasSupportForWebauthn,
      });
    });
    // Tie sentry issues to logrocket recordings
    LogRocket.getSessionURL(sessionURL => {
      Sentry.configureScope(scope => {
        scope.setExtra('sessionURL', sessionURL);
      });
    });
  }
};

export const configureSentry = () => {
  if (SENTRY_DSN && COMMIT_SHA) {
    Sentry.init({
      dsn: SENTRY_DSN,
      release: COMMIT_SHA,
      environment: VERCEL_ENV,
      beforeSend(rawEvent) {
        if (!IS_PROD) {
          return rawEvent;
        }
        const event = { ...rawEvent };
        const logRocketSession = LogRocket.sessionURL;
        if (logRocketSession !== null) {
          if (!event.extra) {
            event.extra = {};
          }
          event.extra.LogRocket = logRocketSession;
          return event;
        }
        return event;
      },
    });
  }
};
