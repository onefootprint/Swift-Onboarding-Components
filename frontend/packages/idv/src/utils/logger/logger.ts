import { getSessionId } from '@onefootprint/dev-tools';
import { getErrorMessage } from '@onefootprint/request';
import * as Sentry from '@sentry/nextjs';
import * as LogRocket from 'logrocket';

import { IS_LOGGING_ENABLED } from './constants';
import type { PrimitiveData } from './types';
import getEnvInfo from './utils/get-env-info';
import configureLogRocket from './utils/log-rocket';
import configureObserve, { Observe } from './utils/observe';
import {
  registerErrorHandlers,
  registerUnloadHandler,
} from './utils/register-event-listeners';
import configureSentry from './utils/sentry';

const LoggerFactory = () => {
  let appName: string = '';
  let isLREnabled: boolean = false;

  const init = (app: string, disableLogRocket?: boolean) => {
    if (!IS_LOGGING_ENABLED) {
      return;
    }
    appName = app;
    isLREnabled = !disableLogRocket;

    configureObserve(appName);
    configureSentry(appName);
    if (isLREnabled) {
      configureLogRocket(appName);
      Observe.setLogRocketSessionUrl();
    }

    getEnvInfo().then(identify);

    const onError = (error: Error) => {
      Observe.log('error', {
        level: 'error',
        cause: error.cause,
        error: getErrorMessage(error),
      });
      Sentry.captureException(error);
      if (isLREnabled) {
        LogRocket.captureException(error);
      }
    };

    registerErrorHandlers(onError);
    registerUnloadHandler();
  };

  const identify = (traits: PrimitiveData) => {
    if (!IS_LOGGING_ENABLED) {
      return;
    }

    const filteredTraits = filterTraits(traits);
    const sessionId = getSessionId();
    Sentry.setUser({
      id: sessionId,
    });
    Sentry.setTags(filteredTraits);
    Observe.identify(sessionId, filteredTraits);
    if (isLREnabled) {
      LogRocket.identify(sessionId, filteredTraits);
    }
  };

  const filterTraits = (traits: PrimitiveData) =>
    Object.fromEntries(
      Object.entries(traits).filter(
        ([, value]) => value !== null && value !== undefined && value !== '',
      ),
    );

  const enableLogRocket = () => {
    if (isLREnabled) {
      return;
    }

    isLREnabled = true;
    configureLogRocket(appName);
    Observe.setLogRocketSessionUrl();
  };

  const track = (eventName: string, extra: PrimitiveData) => {
    if (!IS_LOGGING_ENABLED) {
      return;
    }

    const filteredExtra = filterTraits(extra);
    if (isLREnabled) {
      LogRocket.track(eventName, {
        level: 'track',
        ...filteredExtra,
      });
    }
    Observe.log(eventName, { extra: filteredExtra, level: 'track' });
    // The breadcrumbs will be included with future exceptions sent to Sentry
    Sentry.addBreadcrumb({
      type: 'track',
      message: eventName,
      data: filteredExtra,
      // Sentry.io expects a string here even though the SDK type is number
      timestamp: new Date().toISOString() as unknown as number,
    });
  };

  const error = (err: unknown, extra?: PrimitiveData) => {
    if (!IS_LOGGING_ENABLED) {
      return;
    }

    const filteredExtra = filterTraits(extra || {});
    const errorMessage = getErrorMessage(err);
    const errorObj: Error =
      err instanceof Error ? (err as Error) : new Error(errorMessage);
    Sentry.captureException(errorMessage, filteredExtra);
    Observe.log(errorMessage, {
      extra: filteredExtra,
      errorObj,
      level: 'error',
    });

    if (isLREnabled) {
      LogRocket.captureException(errorObj, {
        extra: {
          ...filteredExtra,
          level: 'error',
        },
      });
    }
  };

  const warn = (message: string, extra?: PrimitiveData) => {
    if (!IS_LOGGING_ENABLED) {
      return;
    }

    const filteredExtra = filterTraits(extra || {});
    if (isLREnabled) {
      LogRocket.log(message, {
        level: 'warn',
        ...filteredExtra,
      });
    }
    Sentry.captureMessage(message, { extra: filteredExtra, level: 'warning' });
    Observe.log(message, { extra: filteredExtra, level: 'warn' });
  };

  const info = (message: string, extra?: PrimitiveData) => {
    if (!IS_LOGGING_ENABLED) {
      return;
    }

    const filteredExtra = filterTraits(extra || {});
    if (isLREnabled) {
      LogRocket.log(message, {
        level: 'info',
        ...filteredExtra,
      });
    }
    Sentry.captureMessage(message, { extra: filteredExtra, level: 'info' });
    Observe.log(message, { extra: filteredExtra, level: 'info' });
  };

  return {
    init,
    identify,
    track,
    error,
    warn,
    info,
    enableLogRocket,
  };
};

const Logger = LoggerFactory();

// TODO: delete this getLogger method
export const getLogger = (location?: string) => ({
  logInfo: (str: string, err?: unknown) =>
    Logger.info(`${str} ${err ? getErrorMessage(err) : ''} in ${location}`),
  logWarn: (str: string, err?: unknown) =>
    Logger.warn(`${str} ${err ? getErrorMessage(err) : ''} in ${location}`),
  logError: (str: string, err?: unknown) =>
    Logger.error(`${str} ${err ? getErrorMessage(err) : ''} in ${location}`),
});

export default Logger;
