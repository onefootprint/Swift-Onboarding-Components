import { IS_BROWSER, IS_PROD } from '@onefootprint/global-constants';
import * as Sentry from '@sentry/nextjs';
import * as LogRocket from 'logrocket';
// @ts-ignore
import * as setupLogRocketReact from 'logrocket-react';
import UAParser from 'ua-parser-js';

import getSessionId from '../session-id';

const BASE_URL_DOMAIN = 'onefootprint.com';
const LOG_ROCKET_ORG_ID = 'lrswdg/footprint-bifrost-prod';

const IS_TEST = typeof jest !== 'undefined';
const IS_LOGGING_ENABLED = IS_BROWSER && !IS_TEST && IS_PROD;

export const COMMIT_SHA = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA;
export const DEPLOYMENT_URL = process.env.NEXT_PUBLIC_VERCEL_URL;
export const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
export const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
export const VERCEL_ENV = process.env.NEXT_PUBLIC_VERCEL_ENV;

type PrimitiveData = Record<string, string | number | boolean>;

// Allow the apps to set custom context data like tenant name or bifrost session id etc. that can be emitted with each item.
const identify = (context: PrimitiveData) => {
  if (!IS_LOGGING_ENABLED) {
    return;
  }

  const sessionId = getSessionId();
  LogRocket.identify(sessionId, context);
};

const checkDeviceInfo = async (): Promise<PrimitiveData> => {
  const uaParser = new UAParser();
  const device = uaParser.getDevice();
  const os = uaParser.getOS();
  const browser = uaParser.getBrowser();

  let hasSupportForWebauthn = false;
  if (window.PublicKeyCredential) {
    hasSupportForWebauthn =
      await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  }

  return {
    deviceModel: device.model || '',
    deviceType: device.type || 'desktop',
    deviceVendor: device.vendor || '',
    osName: os.name || '',
    osVersion: os.version || '',
    browserName: browser.name || '',
    browserVersion: browser.version || '',
    hasSupportForWebauthn: !!hasSupportForWebauthn,
  };
};

const registerErrorHandlers = () => {
  if (!IS_LOGGING_ENABLED) {
    return;
  }

  window.addEventListener(
    'unhandledrejection',
    (event: PromiseRejectionEvent) => {
      const error =
        (event.reason as Error) ||
        new Error("Unhandled rejection, missing 'reason'");
      LogRocket.captureException(error);
    },
    {
      passive: true,
    },
  );

  window.addEventListener(
    'error',
    (event: ErrorEvent) => {
      const error = (event.error as Error) || new Error(event.message);
      LogRocket.captureException(error);
    },
    {
      passive: true,
    },
  );
};

const configureLogRocket = (appName: string) => {
  if (!IS_LOGGING_ENABLED) {
    return;
  }
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
  checkDeviceInfo().then((info: PrimitiveData) => {
    LogRocket.identify(sessionId, {
      app: appName,
      ...info,
      release: COMMIT_SHA ?? '',
    });
  });

  // Tie sentry issues to logrocket recordings
  LogRocket.getSessionURL(sessionURL => {
    Sentry.configureScope(scope => {
      scope.setExtra('sessionURL', sessionURL);
    });
  });
};

const configureSentry = () => {
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

const setup = (appName: string) => {
  if (!IS_LOGGING_ENABLED) {
    return;
  }

  configureSentry();
  configureLogRocket(appName);
  registerErrorHandlers();
};

const info = (...args: any[]) => {
  if (!IS_LOGGING_ENABLED) {
    return;
  }

  LogRocket.info(...args);
};

const warn = (message: string, location?: string) => {
  if (!IS_LOGGING_ENABLED) {
    return;
  }

  LogRocket.warn(message, location);
};

const error = (message: string, location?: string) => {
  if (!IS_LOGGING_ENABLED) {
    return;
  }

  LogRocket.error(message, location);
};

const track = (eventName: string, customData: PrimitiveData) => {
  if (!IS_LOGGING_ENABLED) {
    return;
  }

  LogRocket.track(`track-${eventName}`, customData);
};

const Logger = {
  error,
  warn,
  info,
  setup,
  identify,
  track,
};

export default Logger;
