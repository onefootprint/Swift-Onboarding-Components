export const COMMIT_SHA = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA;
export const DEPLOYMENT_URL = process.env.NEXT_PUBLIC_VERCEL_URL;
export const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
export const VERCEL_ENV = process.env.NEXT_PUBLIC_VERCEL_ENV;

export const SHOW_APP_CLIP_BANNER =
  process.env.NEXT_PUBLIC_APP_CLIP_ENABLED === 'true';
