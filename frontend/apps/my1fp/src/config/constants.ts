export const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
export const COMMIT_SHA = process.env.NEXT_PUBLIC_COMMIT_SHA;

export const LOGGED_OUT_ROUTES = ['/login'];
export const DEFAULT_LOGGED_IN_ROUTE = '/';
export const DEFAULT_LOGGED_OUT_ROUTE = '/login';

export const MY1FP_AUTH_HEADER = 'X-My1fp-Authorization';
export const MY1FP_USER_AUTH_HEADER = 'X-Fpuser-Authorization';
export const MY1FP_BIOMETRIC_SCOPED_AUTH_HEADER = 'X-d2p-Authorization';
