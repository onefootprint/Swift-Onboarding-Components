import { datadogLogs } from '@datadog/browser-logs';
import { getSessionId } from '@onefootprint/dev-tools';
import { getErrorMessage } from '@onefootprint/request';
// import * as Sentry from '@sentry/nextjs';
import * as LogRocket from 'logrocket';

import { IS_LOGGING_ENABLED } from './constants';
import type { ExtraProps, PrimitiveData } from './types';
import initDataDog, {
  dataDogErrorEvent,
  dataDogInfoEvent,
  dataDogTrackEvent,
  dataDogWarnEvent,
} from './utils/datadog';
import getEnvInfo from './utils/get-env-info';
import initLogRocket, {
  logRocketErrorEvent,
  logRocketInfoEvent,
  logRocketTrackEvent,
  logRocketWarnEvent,
} from './utils/log-rocket';
import initObserve, {
  Observe,
  observeErrorCauseEvent,
  observeErrorEvent,
  observeInfoEvent,
  observeTrackEvent,
  observeWarnEvent,
} from './utils/observe';
import {
  registerErrorHandlers,
  registerUnloadHandler,
} from './utils/register-event-listeners';
// import initSentry, {
//   sentryErrorEvent,
//   sentryInfoEvent,
//   sentryTrackEvent,
//   sentryWarnEvent,
// } from './utils/sentry';

/**
 * Filters out any traits that are null, undefined, or empty strings.
 *
 * @param traits The object to filter.
 * @returns An object with the same shape as `traits`, but with any null, undefined, or empty string values removed.
 */
const filterNonEmptyTraits = (traits: PrimitiveData): ExtraProps =>
  Object.fromEntries(
    Object.entries(traits).filter(
      ([, value]) => value !== null && value !== undefined && value !== '',
    ),
  );

const LoggerFactory = () => {
  let appName: string = '';
  let isLogRocketEnabled: boolean = false;
  let isDataDogEnabled: boolean = false;
  let isObserveEnabled: boolean = false;

  const init = (app: string, disableLogRocket?: boolean) => {
    if (!IS_LOGGING_ENABLED) return;

    appName = app;
    isLogRocketEnabled = !disableLogRocket;

    // initSentry(appName);
    isObserveEnabled = initObserve(appName);
    isDataDogEnabled = initDataDog(appName);
    if (isLogRocketEnabled) {
      initLogRocket(appName);
      if (isObserveEnabled) Observe.setLogRocketSessionUrl();
    }

    getEnvInfo().then(identify).catch(console.warn);

    const onError = (error: Error) => {
      // sentryErrorEvent(error);
      if (isObserveEnabled) observeErrorCauseEvent(error);
      if (isLogRocketEnabled) logRocketErrorEvent(error);
      if (isDataDogEnabled) dataDogErrorEvent(error);
    };

    registerErrorHandlers(onError);
    registerUnloadHandler();
  };

  const identify = (traits: PrimitiveData) => {
    if (!IS_LOGGING_ENABLED) return;

    const filteredTraits = filterNonEmptyTraits(traits);
    const sessionId = getSessionId();

    // Sentry.setUser({ id: sessionId });
    // Sentry.setTags(filteredTraits);
    if (isObserveEnabled) Observe.identify(sessionId, filteredTraits);
    if (isLogRocketEnabled) LogRocket.identify(sessionId, filteredTraits);
    if (isDataDogEnabled)
      datadogLogs.setGlobalContext({
        ...filteredTraits,
        fp_session_id: sessionId,
      });
  };

  const enableLogRocket = () => {
    if (isLogRocketEnabled) return;

    isLogRocketEnabled = true;
    initLogRocket(appName);
    if (isObserveEnabled) Observe.setLogRocketSessionUrl();
  };

  const track = (msg: string, extra: PrimitiveData) => {
    if (!IS_LOGGING_ENABLED) return;

    const filteredExtra = filterNonEmptyTraits(extra);

    // sentryTrackEvent(msg, filteredExtra);
    if (isObserveEnabled) observeTrackEvent(msg, filteredExtra);
    if (isLogRocketEnabled) logRocketTrackEvent(msg, filteredExtra);
    if (isDataDogEnabled) dataDogTrackEvent(msg, filteredExtra);
  };

  const error = (err: unknown, extra?: PrimitiveData, msg?: string) => {
    if (!IS_LOGGING_ENABLED) return;

    const filteredExtra = filterNonEmptyTraits(extra || {});
    const errorMessage = msg || getErrorMessage(err);
    const errorObj: Error =
      err instanceof Error ? err : new Error(errorMessage);

    // sentryErrorEvent(errorMessage, filteredExtra);
    if (isObserveEnabled) {
      observeErrorEvent(errorMessage, errorObj, filteredExtra);
    }
    if (isLogRocketEnabled) {
      logRocketErrorEvent(errorObj, { ...filteredExtra, level: 'error' });
    }
    if (isDataDogEnabled) {
      dataDogErrorEvent(errorObj, errorMessage, filteredExtra);
    }
  };

  const warn = (msg: string, extra?: PrimitiveData, err?: unknown) => {
    if (!IS_LOGGING_ENABLED) return;
    const filteredExtra = filterNonEmptyTraits(extra || {});

    // sentryWarnEvent(msg, filteredExtra);
    if (isObserveEnabled) observeWarnEvent(msg, filteredExtra);
    if (isLogRocketEnabled) logRocketWarnEvent(msg, filteredExtra);
    if (isDataDogEnabled) dataDogWarnEvent(msg, filteredExtra, err);
  };

  const info = (msg: string, extra?: PrimitiveData) => {
    if (!IS_LOGGING_ENABLED) return;
    const filteredExtra = filterNonEmptyTraits(extra || {});

    // sentryInfoEvent(msg, filteredExtra);
    if (isObserveEnabled) observeInfoEvent(msg, filteredExtra);
    if (isLogRocketEnabled) logRocketInfoEvent(msg, filteredExtra);
    if (isDataDogEnabled) dataDogInfoEvent(msg, filteredExtra);
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

export const getLogger = (
  preExtra: PrimitiveData = Object.create(null),
): {
  logError: (msg: string, err?: unknown, extra?: PrimitiveData) => void;
  logWarn: (msg: string, err?: unknown, extra?: PrimitiveData) => void;
  logInfo: (msg: string, extra?: PrimitiveData) => void;
  logTrack: (msg: string, extra?: PrimitiveData) => void;
} => ({
  logTrack: (msg: string, extra?: PrimitiveData) =>
    Logger.track(msg, { ...preExtra, ...extra }),

  logInfo: (msg: string, extra?: PrimitiveData) =>
    Logger.info(msg, { ...preExtra, ...extra }),

  logWarn: (msg: string, err?: unknown, extra?: PrimitiveData) =>
    Logger.warn(msg, { ...preExtra, ...extra }, err),

  logError: (msg: string, err?: unknown, extra?: PrimitiveData) =>
    Logger.error(err, { ...preExtra, ...extra }, msg),
});

export default Logger;
