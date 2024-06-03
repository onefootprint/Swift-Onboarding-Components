import { datadogLogs } from '@datadog/browser-logs';
import { getSessionId } from '@onefootprint/dev-tools';
import { getErrorMessage } from '@onefootprint/request';
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
import { registerErrorHandlers } from './utils/register-event-listeners';

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

  const init = (app: string, disableLogRocket?: boolean) => {
    if (!IS_LOGGING_ENABLED) return;

    appName = app;
    isLogRocketEnabled = !disableLogRocket;

    isDataDogEnabled = initDataDog(appName);
    if (isLogRocketEnabled) initLogRocket(appName);

    getEnvInfo().then(identify).catch(console.warn);

    const onError = (error: Error) => {
      if (isLogRocketEnabled) logRocketErrorEvent(error);
      if (isDataDogEnabled) dataDogErrorEvent(error);
    };

    registerErrorHandlers(onError);
  };

  const identify = (traits: PrimitiveData) => {
    if (!IS_LOGGING_ENABLED) return;

    const sessionId = getSessionId();
    const contextProps = {
      ...filterNonEmptyTraits(traits),
      fp_session_id: sessionId,
    };

    if (isLogRocketEnabled) LogRocket.identify(sessionId, contextProps);
    if (isDataDogEnabled) datadogLogs.setGlobalContext(contextProps);
  };

  const enableLogRocket = () => {
    if (isLogRocketEnabled) return;

    isLogRocketEnabled = true;
    initLogRocket(appName);
  };

  const track = (msg: string, extra: PrimitiveData) => {
    if (!IS_LOGGING_ENABLED) return;

    const filteredExtra = filterNonEmptyTraits(extra);

    if (isLogRocketEnabled) logRocketTrackEvent(msg, filteredExtra);
    if (isDataDogEnabled) dataDogTrackEvent(msg, filteredExtra);
  };

  const error = (err: unknown, extra?: PrimitiveData, msg?: string) => {
    if (!IS_LOGGING_ENABLED) return;

    const filteredExtra = filterNonEmptyTraits(extra || {});
    const errorMessage = msg || getErrorMessage(err);
    const errorObj: Error =
      err instanceof Error ? err : new Error(errorMessage);

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

    if (isLogRocketEnabled) logRocketWarnEvent(msg, filteredExtra);
    if (isDataDogEnabled) dataDogWarnEvent(msg, filteredExtra, err);
  };

  const info = (msg: string, extra?: PrimitiveData) => {
    if (!IS_LOGGING_ENABLED) return;
    const filteredExtra = filterNonEmptyTraits(extra || {});

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

export const uniqueLogger = (logger: (_: string) => void) => {
  let prev = '';
  return (curr: string) => {
    if (prev === curr) return undefined;

    prev = curr;
    return logger(curr);
  };
};

export default Logger;
