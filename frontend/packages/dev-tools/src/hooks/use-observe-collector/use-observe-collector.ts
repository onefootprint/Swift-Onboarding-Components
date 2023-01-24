import constate from 'constate';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import UAParser from 'ua-parser-js';
import { useDebouncedCallback } from 'use-debounce';
import { useEventListener } from 'usehooks-ts';

import getSessionId from '../../utils/session-id/session-id';
import sendObservePayload from './hooks/send-observe-payload';
import getClickedElementInfo, {
  getClickedElementContextInPage,
} from './utils/get-click-element-info/get-click-element-info';
import getErrorEventInfo from './utils/get-error-event-info';
import getNavigatorProperties from './utils/get-navigator-properties';

const DEBOUNCE_INTERVAL = 10000; // 10 seconds
const MAX_DEBOUNCE = 60000; // 1 min
const IS_SSR = typeof window === 'undefined';

const useObserveCollectorImpl = () => {
  const router = useRouter();
  const queue: Record<string, any>[] = [];
  const userAgent = new UAParser().getResult();
  const clientContext: Record<string, any> = IS_SSR
    ? {}
    : {
        navigator: getNavigatorProperties(),
        host: window.location.host,
        browser: userAgent.browser,
        device: userAgent.device,
        os: userAgent.os,
        engine: userAgent.engine,
        cpu: userAgent.cpu,
      };
  let appContext: Record<string, any> = {};

  const debouncedSendQueue = useDebouncedCallback(
    () => {
      if (IS_SSR) {
        return;
      }
      sendQueue();
    },
    DEBOUNCE_INTERVAL,
    {
      maxWait: MAX_DEBOUNCE,
    },
  );

  if (!IS_SSR) {
    // Overwrite console.error and console.warn implementations to also log here
    const consoleError = window.console.error;
    window.console.error = (...args: any[]) => {
      consoleError(args);
      const stringArgs = args.map((arg: any) => `${arg}`);
      log('error', {
        message: stringArgs.join(' '),
        arguments: stringArgs,
        eventType: 'console',
      });
    };

    const consoleWarn = window.console.warn;
    window.console.warn = (...args: any[]) => {
      consoleWarn(args);
      const stringArgs = args.map((arg: any) => `${arg}`);
      log('warn', {
        message: stringArgs.join(' '),
        arguments: stringArgs,
        eventType: 'console',
      });
    };
  }

  const addToQueue = (payload: Record<string, any>) => {
    if (IS_SSR) {
      return;
    }
    queue.push({
      ...payload,
      sessionId: getSessionId(),
      path: router.asPath,
      timestamp: Date.now(),
      clientContext,
      appContext,
    });
    debouncedSendQueue();
  };

  const log = (action: string, data?: Record<string, any>) => {
    const payload = {
      action,
      data,
    };
    addToQueue(payload);
  };

  const logError = (
    event: Event | string,
    error: Error,
    extra?: Record<string, any>,
  ) => {
    const info = {
      ...getErrorEventInfo(event, error),
      ...extra,
    };
    const existingIndex = queue.findIndex(
      ({ action, data }) =>
        action === 'error' &&
        JSON.stringify({ ...data, errorId: '' }) ===
          JSON.stringify({ ...info, errorId: '' }),
    );
    if (existingIndex > -1) {
      queue.splice(existingIndex, 1, info);
    } else {
      log('error', info);
    }
  };

  const sendQueue = () => {
    if (IS_SSR || !queue.length) {
      return;
    }
    const numItems = queue.length;
    const items = queue.splice(0, numItems);
    sendObservePayload(items);
  };

  useEventListener('beforeunload', () => {
    debouncedSendQueue.flush();
    debouncedSendQueue.cancel();
  });

  useEventListener(
    'error',
    (event: ErrorEvent) => {
      const error = (event.error as Error) || new Error(event.message);
      logError(event, error);
    },
    undefined,
    { passive: true },
  );

  useEventListener(
    'unhandledrejection',
    (event: PromiseRejectionEvent) => {
      const error =
        (event.reason as Error) ||
        new Error("Unhandled rejection, missing 'reason'");
      logError(event, error);
    },
    undefined,
    {
      passive: true,
    },
  );

  useEventListener('click', (e: MouseEvent) => {
    if (!(e.target instanceof HTMLElement)) {
      return;
    }
    log('click', {
      item: getClickedElementInfo(e.target),
      pageContext: getClickedElementContextInPage(e.target),
    });
  });

  useEffect(() => {
    log('page-change');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.asPath]);

  // Allow the apps to set custom context data like bifrost session id etc. that can be emitted with each item.
  const setAppContext = (appName: string, appData?: Record<string, any>) => {
    appContext = {
      name: appName,
      data: appData,
    };
  };

  return { setAppContext, log, logError };
};

const [Provider, useObserveCollector] = constate(useObserveCollectorImpl);
export const ObserveCollectorProvider = Provider;
export default useObserveCollector;
