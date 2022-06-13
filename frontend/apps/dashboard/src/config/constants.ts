export const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
export const COMMIT_SHA = process.env.NEXT_PUBLIC_COMMIT_SHA;
export const LOGGED_OUT_ROUTES = [
  '/login',
  '/login/email',
  '/login/link-sent',
  '/auth',
];
export const DEFAULT_LOGGED_IN_ROUTE = '/users';
export const DEFAULT_LOGGED_OUT_ROUTE = '/login';
export const DASHBOARD_AUTHORIZATION_HEADER = 'x-fp-dashboard-authorization';

export const GOOGLE_REDIRECT_URL = process.env.NEXT_PUBLIC_URL;
