export const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
export const COMMIT_SHA = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA;
export const DEPLOYMENT_URL = process.env.NEXT_PUBLIC_VERCEL_URL;
export const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export const PUBLIC_ROUTES = [
  '/sign-up',
  '/login',
  '/login/email',
  '/login/link-sent',
  '/organizations',
];

export const TRANSITION_ROUTES = ['/auth', '/logout', '/organizations'];
export const DEFAULT_PUBLIC_ROUTE = '/users';
export const DEFAULT_PRIVATE_ROUTE = '/login';
export const DASHBOARD_AUTHORIZATION_HEADER = 'x-fp-dashboard-authorization';
export const DASHBOARD_IS_LIVE_HEADER = 'x-is-live';
