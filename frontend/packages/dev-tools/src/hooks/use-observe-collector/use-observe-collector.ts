import { IS_DEV, IS_SERVER } from '@onefootprint/global-constants';
import constate from 'constate';
import debounce from 'lodash/debounce';
import { useRouter } from 'next/router';
import { useCallback, useEffect } from 'react';
import UAParser from 'ua-parser-js';
import { useEffectOnce, useEventListener } from 'usehooks-ts';

import getSessionId from '../../utils/session-id';
import getErrorEventInfo from './utils/get-error-event-info';
import getNavigatorProperties from './utils/get-navigator-properties';
import sendObservePayload from './utils/send-observe-payload';

const DEBOUNCE_INTERVAL = 10000; // 10 seconds
const MAX_DEBOUNCE = 30000; // 30 seconds
const IS_TEST = typeof jest !== 'undefined';
const IS_LOGGING_DISABLED = IS_SERVER || IS_DEV || IS_TEST;

type ObserveCollectorProps = {
  appName: string;
};

const useObserveCollectorImpl = ({ appName }: ObserveCollectorProps) => {
  const router = useRouter();
  const queue: Record<string, any>[] = [];
  const userAgent = new UAParser().getResult();
  const clientContext: Record<string, any> = IS_LOGGING_DISABLED
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
  const environment: Record<string, any> = {
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.NEXT_PUBLIC_VERCEL_ENV || 'local',
    gitCommitRef: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF || '',
    gitCommitSha: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || '',
    deploymentUrl: process.env.NEXT_PUBLIC_VERCEL_URL || '',
    apiUrl: process.env.NEXT_PUBLIC_API_BASE_URL || '',
  };
  let appContext: Record<string, any> = {};

  if (!IS_LOGGING_DISABLED) {
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
    if (IS_LOGGING_DISABLED) {
      return;
    }

    queue.push({
      ...payload,
      sessionId: getSessionId(),
      path: router.asPath,
      timestamp: Date.now(),
      clientContext,
      environment,
      appContext: {
        name: appName,
        data: appContext,
      },
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
    if (IS_LOGGING_DISABLED || !queue.length) {
      return;
    }
    const numItems = queue.length;
    const items = queue.splice(0, numItems);
    sendObservePayload(items);
  };

  const debouncedSendQueue = useCallback(
    debounce(sendQueue, DEBOUNCE_INTERVAL, { maxWait: MAX_DEBOUNCE }),
    [queue],
  );

  useEffectOnce(() => {
    // So that we can calculate session duration
    log('session-start');
  });

  useEffect(() => {
    log('page-change');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.asPath]);

  useEventListener('beforeunload', () => {
    log('session-end');
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

  // Allow the apps to set custom context data like tenant name or bifrost session id etc. that can be emitted with each item.
  const setAppContext = (data?: Record<string, any>) => {
    if (IS_LOGGING_DISABLED) {
      return;
    }
    appContext = {
      ...appContext,
      ...data,
    };
  };

  return { setAppContext, log, logError };
};

const [Provider, useObserveCollector] = constate(useObserveCollectorImpl);
export const ObserveCollectorProvider = Provider;
export default useObserveCollector;
