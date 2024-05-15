import * as Sentry from '@sentry/nextjs';

import { Observe } from './observe';

export const registerUnloadHandler = () => {
  window.addEventListener('beforeunload', () => {
    Observe.flush();
    Sentry.flush();
  });
};

export const registerErrorHandlers = (onError: (error: Error) => void) => {
  window.addEventListener(
    'unhandledrejection',
    (event: PromiseRejectionEvent) => {
      const error =
        (event.reason as Error) ||
        new Error("Unhandled rejection, missing 'reason'");
      onError(error);
    },
    {
      passive: true,
    },
  );

  window.addEventListener(
    'error',
    (event: ErrorEvent) => {
      const error = (event.error as Error) || new Error(event.message);
      onError(error);
    },
    {
      passive: true,
    },
  );
};
