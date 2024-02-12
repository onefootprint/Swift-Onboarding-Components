import { getSessionId } from '@onefootprint/dev-tools';
import { IS_BROWSER, IS_PROD } from '@onefootprint/global-constants';
import { getErrorMessage } from '@onefootprint/request';
import * as Sentry from '@sentry/nextjs';
import * as LogRocket from 'logrocket';
// @ts-ignore
import * as setupLogRocketReact from 'logrocket-react';
import UAParser from 'ua-parser-js';

const IS_TEST = typeof jest !== 'undefined';
const BASE_URL_DOMAIN = 'onefootprint.com';
const LOG_ROCKET_ORG_ID = 'lrswdg/footprint-bifrost-prod';
const IS_CONSOLE_ENABLED = IS_BROWSER && !IS_TEST;

const IS_LOGGING_ENABLED =
  IS_BROWSER && IS_PROD && process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';

export const COMMIT_SHA = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA;
export const DEPLOYMENT_URL = process.env.NEXT_PUBLIC_VERCEL_URL;
export const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
export const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
export const VERCEL_ENV = process.env.NEXT_PUBLIC_VERCEL_ENV;

type PrimitiveData = Record<string, string | number | boolean>;
type LogFn = (str: string, err?: unknown) => void;
type BasicLevel = keyof Pick<typeof Logger, 'info' | 'warn' | 'error'>;
type MakeLoggerOutput = {
  logError: LogFn;
  logInfo: LogFn;
  logWarn: LogFn;
};

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
    deviceType: device.type || 'unknown',
    deviceVendor: device.vendor || '',
    osName: os.name || '',
    osVersion: os.version || '',
    browserName: browser.name || '',
    browserVersion: browser.version || '',
    hasSupportForWebauthn: hasSupportForWebauthn ? 'true' : 'false',
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
        if (!IS_LOGGING_ENABLED) {
          return rawEvent;
        }
        const event = { ...rawEvent };
        if (!event.extra) {
          event.extra = {};
        }
        const logRocketSession = LogRocket.sessionURL;
        if (logRocketSession) {
          event.extra.LogRocket = logRocketSession;
        }
        event.extra.sessionId = getSessionId();
        return event;
      },
    });
  }
};

const setupLogRocket = (appName: string) => {
  if (!IS_LOGGING_ENABLED) {
    return;
  }

  configureLogRocket(appName);
  registerErrorHandlers();
};

const setupSentry = () => {
  if (!IS_LOGGING_ENABLED) {
    return;
  }

  configureSentry();
};

const info = (message: string, location: string = '') => {
  if (IS_CONSOLE_ENABLED) {
    console.info(message, location); // eslint-disable-line no-console
  }

  if (IS_LOGGING_ENABLED) {
    LogRocket.info(message, location);
  }
};

const warn = (message: string, location: string = '') => {
  if (IS_CONSOLE_ENABLED) {
    console.warn(message, location);
  }

  if (IS_LOGGING_ENABLED) {
    LogRocket.warn(message, location);
  }
};

const error = (message: string, location: string = '') => {
  if (IS_CONSOLE_ENABLED) {
    console.error(message, location);
  }

  if (IS_LOGGING_ENABLED) {
    LogRocket.error(message, location);
  }
};

const track = (eventName: string, customData: PrimitiveData) => {
  if (IS_LOGGING_ENABLED) {
    LogRocket.track(`track-${eventName}`, customData);
  }
};

const Logger = {
  error,
  warn,
  info,
  setupSentry,
  setupLogRocket,
  identify,
  track,
};

export const getLogger = (location?: string): MakeLoggerOutput => {
  const logFunction = (level: BasicLevel, str: string, err?: unknown) => {
    Logger[level](`${str} ${err ? getErrorMessage(err) : ''}`, location);
  };

  return {
    logInfo: (str, err) => logFunction('info', str, err),
    logWarn: (str, err) => logFunction('warn', str, err),
    logError: (str, err) => logFunction('error', str, err),
  };
};

export default Logger;
