import { getSessionId } from '@onefootprint/dev-tools';
import { getErrorMessage } from '@onefootprint/request';
import debounce from 'lodash/debounce';
import LogRocket from 'logrocket';

import type { ExtraProps, PrimitiveData } from '../types';

const IS_OBSERVE_ENABLED =
  process.env.NEXT_PUBLIC_IS_OBSERVE_ENABLED === 'true';
const OBSERVE_INGEST_TOKEN = IS_OBSERVE_ENABLED
  ? 'ds1FFZo4VU4NEv9yYems:2b8XTbUIjt5vRarHo7bc716EXZSICoDi'
  : '';
const OBSERVE_INGEST_URL = IS_OBSERVE_ENABLED
  ? 'https://189225732777.collect.observeinc.com/v1/http/?observe_token=ds1FFZo4VU4NEv9yYems:2b8XTbUIjt5vRarHo7bc716EXZSICoDi'
  : '';

const sendObservePayload = IS_OBSERVE_ENABLED
  ? async (data: Record<string, unknown>[]) => {
      fetch(OBSERVE_INGEST_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${OBSERVE_INGEST_TOKEN}`,
          'Content-type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify(data),
        mode: 'no-cors',
        credentials: 'include',
      }).catch(error => {
        // Not too much we can do here.
        console.log('Sending frontend telemetry to Observe failed: ', error); // eslint-disable-line no-console
      });
    }
  : (_: Record<string, unknown>[]) => Promise.resolve(); // eslint-disable-line @typescript-eslint/no-unused-vars

const DEBOUNCE_INTERVAL = 10000; // 10 seconds
const MAX_DEBOUNCE = 30000; // 30 seconds

const ObserveFactory = () => {
  const queue: Record<string, unknown>[] = [];
  let context: PrimitiveData = {};

  const init = (appName: string): boolean => {
    context.sessionStartTimestamp = Date.now();
    context.appName = appName;
    context.sessionId = getSessionId();
    return true;
  };

  const identify = (sessionId: string, newContext: PrimitiveData) => {
    context = {
      sessionId,
      ...context,
      ...newContext,
    };
  };

  const setLogRocketSessionUrl = () => {
    LogRocket.getSessionURL(logRocketSessionUrl => {
      context.logRocketSession = logRocketSessionUrl;
    });
  };

  const sendQueue = () => {
    const numItems = queue.length;
    const items = queue.splice(0, numItems);
    sendObservePayload(items);
  };

  const debouncedSendQueue = debounce(sendQueue, DEBOUNCE_INTERVAL, {
    maxWait: MAX_DEBOUNCE,
  });

  const getScrubbedUrl = () => {
    const { href } = window.location;
    const urlParts = href.split('#');
    if (urlParts.length < 2) {
      return href;
    }

    // Only leave the first 3 characters, delete the rest and add ... at the end
    const scrubbedHash = `${urlParts[1].substring(0, 3)}...`;
    return `${urlParts[0]}#${scrubbedHash}`;
  };

  const addToQueue = (payload: Record<string, unknown>) => {
    queue.push({
      payload,
      context: {
        ...context,
        url: getScrubbedUrl(),
        timestamp: Date.now(),
      },
    });
    debouncedSendQueue();
  };

  const log = (action: string, data: Record<string, unknown>) => {
    addToQueue({
      action,
      data,
    });
  };

  return {
    init,
    identify,
    log,
    flush: sendQueue,
    setLogRocketSessionUrl,
  };
};

export const Observe = IS_OBSERVE_ENABLED
  ? ObserveFactory()
  : {
      init: () => false,
      identify: () => undefined,
      log: () => undefined,
      flush: () => undefined,
      setLogRocketSessionUrl: () => undefined,
    };

export const observeErrorCauseEvent = (error: Error) =>
  Observe.log('error', {
    level: 'error',
    cause: error.cause,
    error: getErrorMessage(error),
  });

export const observeErrorEvent = (
  msg: string,
  errorObj: Error,
  extra: ExtraProps,
) => Observe.log(msg, { level: 'error', errorObj, extra });

export const observeTrackEvent = (msg: string, extra: ExtraProps) =>
  Observe.log(msg, { level: 'track', extra });

export const observeWarnEvent = (msg: string, extra: ExtraProps) =>
  Observe.log(msg, { level: 'warn', extra });

export const observeInfoEvent = (msg: string, extra: ExtraProps) =>
  Observe.log(msg, { level: 'info', extra });

const initObserve = (appName: string) => Observe.init(appName);

export default initObserve;
