import { DASHBOARD_BASE_URL } from '@onefootprint/global-constants';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export const COMMIT_SHA = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA;
export const DEPLOYMENT_URL = process.env.NEXT_PUBLIC_VERCEL_URL;
export const UNIFY_API_KEY = process.env.NEXT_PUBLIC_UNIFY_API_KEY;
export const INTERCOM_APP_ID = process.env.NEXT_PUBLIC_INTERCOM_APP_ID;

export const SIGN_UP_URL = `${DASHBOARD_BASE_URL}/authentication/sign-up`;
export const GET_FORM_URL = 'https://getform.io/f/pbygomeb';
