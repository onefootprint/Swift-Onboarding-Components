// import * as Sentry from '@sentry/nextjs';

import { Observe } from './observe';

export const registerUnloadHandler = () => {
  if (typeof window === 'undefined') return;

  window.addEventListener('beforeunload', () => {
    Observe.flush();
    // Sentry.flush();
  });
};

export const registerErrorHandlers = (onError: (error: Error) => void) => {
  if (typeof window === 'undefined') return;

  window.addEventListener(
    'unhandledrejection',
    (event: PromiseRejectionEvent) => {
      const error =
        event.reason || new Error("Unhandled rejection, missing 'reason'");
      onError(error);
    },
    { passive: true },
  );

  window.addEventListener(
    'error',
    (event: ErrorEvent) => {
      const error = event.error || new Error(event?.message);
      onError(error);
    },
    { passive: true },
  );
};
