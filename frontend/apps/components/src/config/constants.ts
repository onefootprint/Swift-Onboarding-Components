export const COMMIT_SHA = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA;
export const DEPLOYMENT_URL = process.env.NEXT_PUBLIC_VERCEL_URL;
export const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
export const GOOGLE_MAPS_SRC = GOOGLE_MAPS_KEY
  ? `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&loading=async&libraries=places&callback=Function.prototype`
  : undefined;

export const VERCEL_ENV = process.env.NEXT_PUBLIC_VERCEL_ENV;

export const AUTH_HEADER = 'x-fp-authorization';
