import { IS_BROWSER, IS_PROD } from '@onefootprint/global-constants';

export const IS_TEST = typeof jest !== 'undefined' || process.env.NODE_ENV === 'test';
export const BASE_URL_DOMAIN = 'onefootprint.com';

export const COMMIT_SHA = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || '';
export const DEPLOYMENT_URL = process.env.NEXT_PUBLIC_VERCEL_URL || '';
export const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || '';
export const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || '';
export const { NODE_ENV } = process.env;
export const VERCEL_ENV = process.env.NEXT_PUBLIC_VERCEL_ENV || 'local';
export const VERCEL_GIT_COMMIT_REF = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF || '';
export const VERCEL_URL = process.env.NEXT_PUBLIC_VERCEL_URL || '';

export const IS_LOGGING_ENABLED = IS_BROWSER && IS_PROD && VERCEL_ENV === 'production';
