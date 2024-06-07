import type { NextRouter } from 'next/router';

export const isString = (x: unknown): x is string => typeof x === 'string' && !!x;
const isValidTokenFormat = (str: string): boolean => Boolean(str) && /tok_/.test(str);

const getSdkArgsToken = (str: string): string => (isValidTokenFormat(str) ? str : '');

const getQueryArgs = (router: NextRouter) => {
  const { query, asPath } = router;
  const { app_url: appUrl, locale = 'en-US', ob_key: obKey, user_data: rawUserData } = query;
  let userData = {};

  try {
    userData = isString(rawUserData) ? JSON.parse(decodeURIComponent(rawUserData)) : {};
  } catch (_) {
    // do nothing
  }

  return {
    appUrl: String(appUrl),
    authToken: getSdkArgsToken(asPath.split('#')[1]) ?? '',
    locale,
    publicKey: obKey,
    userData,
  };
};

export default getQueryArgs;
