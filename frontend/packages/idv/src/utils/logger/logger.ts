import { datadogLogs } from '@datadog/browser-logs';
import { datadogRum } from '@datadog/browser-rum';
import { getSessionId } from '@onefootprint/dev-tools';
import { getErrorMessage } from '@onefootprint/request';

import { isObject } from '../type-guards';
import { IS_LOGGING_ENABLED } from './constants';
import type { ExtraProps, PrimitiveData } from './types';
import {
  dataDogAction,
  dataDogErrorEvent,
  dataDogInfoEvent,
  dataDogTrackEvent,
  dataDogWarnEvent,
  initDataDogLogs,
  initDataDogRum,
} from './utils/datadog';
import { getDeviceMemory, getDeviceNetwork } from './utils/get-device-info';
import getEnvInfo from './utils/get-env-info';
import { registerErrorHandlers } from './utils/register-event-listeners';

/**
 * Filters out any traits that are null, undefined, or empty strings.
 *
 * @param traits The object to filter.
 * @returns An object with the same shape as `traits`, but with any null, undefined, or empty string values removed.
 */
const filterNonEmptyTraits = (traits: PrimitiveData): ExtraProps =>
  Object.fromEntries(
    Object.entries(traits).filter(([, value]) => value !== null && value !== undefined && value !== ''),
  );

const LoggerFactory = () => {
  let appName: string = '';
  let hasGlobalContext: boolean = false;
  let isDDLogsEnabled: boolean = false;
  let isDDRumEnabled: boolean = false;
  let isSessionReplayOn: boolean = false;

  const init = (app: string, deferSessionRecord?: boolean) => {
    if (!IS_LOGGING_ENABLED) return;

    appName = app;
    isDDLogsEnabled = initDataDogLogs(appName);

    if (!deferSessionRecord) {
      isDDRumEnabled = initDataDogRum(appName);
    }

    getEnvInfo().then(setGlobalContext).catch(console.warn);

    const onError = (error: Error) => {
      if (isDDLogsEnabled) dataDogErrorEvent(error);
    };

    registerErrorHandlers(onError);
  };

  /** Set the entire context for all your loggers */
  const setGlobalContext = (traits: PrimitiveData) => {
    if (!IS_LOGGING_ENABLED) return;
    if (!isDDLogsEnabled && !isDDRumEnabled) return;

    const sessionId = getSessionId();
    const ddSessionId = datadogLogs.getInternalContext()?.session_id;
    const contextProps = {
      ...filterNonEmptyTraits(traits),
      ...getDeviceNetwork(),
      ...getDeviceMemory(),
      fp_session_id: sessionId,
    };
    const context = appName === 'bifrost' && ddSessionId ? { ...contextProps, session_id: ddSessionId } : contextProps;

    if (hasGlobalContext) {
      return appendGlobalContext(context);
    }

    datadogLogs.setGlobalContext(context);
    datadogRum.setGlobalContext(context);
    hasGlobalContext = true;
  };

  /** Add a context to all your loggers */
  const appendGlobalContext = (traits: PrimitiveData) => {
    if (!IS_LOGGING_ENABLED) return;
    if (!isDDLogsEnabled && !isDDRumEnabled) return;

    if (isObject(traits)) {
      Object.entries(traits).forEach(([key, value]) => {
        if (key && value !== null && value !== undefined && value !== '') {
          datadogLogs.setGlobalContextProperty(key, value);
          datadogRum.setGlobalContextProperty(key, value);
        }
      });
    }
  };

  const startSessionReplay = () => {
    if (isSessionReplayOn) return;

    if (!isDDRumEnabled && initDataDogRum(appName)) {
      datadogRum.startSessionReplayRecording();
      isDDRumEnabled = true;
      isSessionReplayOn = true;
    }
  };

  const stopSessionReplay = () => {
    if (!isSessionReplayOn || !isDDRumEnabled) return;
    if (isSessionReplayOn) {
      datadogRum.stopSessionReplayRecording();
      isSessionReplayOn = false;
    }
  };

  const track = (msg: string, extra: PrimitiveData) => {
    if (!IS_LOGGING_ENABLED) return;

    const filteredExtra = filterNonEmptyTraits(extra);

    if (isDDLogsEnabled) dataDogTrackEvent(msg, filteredExtra);
  };

  const error = (err: unknown, extra?: PrimitiveData, msg?: string) => {
    if (!IS_LOGGING_ENABLED) return;

    const filteredExtra = filterNonEmptyTraits(extra || {});
    const errorMessage = [msg, getErrorMessage(err)].filter(Boolean).join(' ');
    const errorObj: Error = err instanceof Error ? err : new Error(errorMessage);

    if (isDDLogsEnabled) {
      dataDogErrorEvent(errorObj, errorMessage, filteredExtra);
    }
  };

  const warn = (msg: string, extra?: PrimitiveData, err?: unknown) => {
    if (!IS_LOGGING_ENABLED) return;
    const filteredExtra = filterNonEmptyTraits(extra || {});

    if (isDDLogsEnabled) dataDogWarnEvent(msg, filteredExtra, err);
  };

  const info = (msg: string, extra?: PrimitiveData) => {
    if (!IS_LOGGING_ENABLED) return;
    const filteredExtra = filterNonEmptyTraits(extra || {});

    if (isDDLogsEnabled) dataDogInfoEvent(msg, filteredExtra);
  };

  return {
    appendGlobalContext,
    error,
    info,
    init,
    setGlobalContext,
    startSessionReplay,
    stopSessionReplay,
    track,
    warn,
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
  logTrack: (msg: string, extra?: PrimitiveData) => Logger.track(msg, { ...preExtra, ...extra }),
  logInfo: (msg: string, extra?: PrimitiveData) => Logger.info(msg, { ...preExtra, ...extra }),
  logWarn: (msg: string, err?: unknown, extra?: PrimitiveData) => Logger.warn(msg, { ...preExtra, ...extra }, err),
  logError: (msg: string, err?: unknown, extra?: PrimitiveData) => Logger.error(err, { ...preExtra, ...extra }, msg),
});

export const trackAction = dataDogAction;

export const uniqueLogger = (logger: (_: string) => void) => {
  let prev = '';
  return (curr: string) => {
    if (prev === curr) return undefined;

    prev = curr;
    return logger(curr);
  };
};

export default Logger;
