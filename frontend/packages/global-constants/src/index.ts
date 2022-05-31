export const IS_BROWSER = typeof window !== 'undefined';
export const IS_SERVER = typeof window === 'undefined';
export const IS_DEV = process.env.NODE_ENV === 'development';
export const IS_PROD = !IS_DEV;

export const API_BASE_URL = 'https://api.dev.infra.footprint.dev';
export const API_TIMEOUT = 60000;
