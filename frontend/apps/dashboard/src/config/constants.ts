export const COMMIT_SHA = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA;
export const DEPLOYMENT_URL = process.env.NEXT_PUBLIC_VERCEL_URL;
export const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export const PUBLIC_ROUTES = ['/authentication/sign-up', '/authentication/sign-in', '/authentication/link-sent'];

export const TRANSITION_ROUTES = ['/auth', '/logout'];
export const DOCS_SITE_LOGIN_ROUTE = '/authentication/docs';
export const DEFAULT_PUBLIC_ROUTE = '/home';
export const DEFAULT_PRIVATE_ROUTE = '/authentication/sign-in';
export const DASHBOARD_AUTHORIZATION_HEADER = 'x-fp-dashboard-authorization';
export const DASHBOARD_IS_LIVE_HEADER = 'x-is-live';
export const DASHBOARD_ALLOW_ASSUMED_WRITES = 'x-allow-assumed-writes';
export const MAIN_PAGE_ID = 'page-main';
