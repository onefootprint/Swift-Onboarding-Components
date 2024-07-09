import type { NextRouter } from 'next/router';

export const isString = (x: unknown): x is string => typeof x === 'string' && !!x;
const isValidTokenFormat = (str: string): boolean => Boolean(str) && /tok_/.test(str);

const getSdkArgsToken = (str: string): string => (isValidTokenFormat(str) ? str : '');

const getQueryArgs = (router: NextRouter) => {
  const { query, asPath } = router;
  const {
    app_url: appUrl,
    bootstrap_data: rawBootstrapData,
    locale = 'en-US',
    ob_key: obKey,
    user_data: rawUserData,
  } = query;
  let bootstrapData = {};

  try {
    bootstrapData = isString(rawBootstrapData)
      ? JSON.parse(decodeURIComponent(rawBootstrapData))
      : isString(rawUserData)
        ? JSON.parse(decodeURIComponent(rawUserData))
        : {};
  } catch (_) {
    // do nothing
  }

  return {
    appUrl: String(appUrl),
    authToken: getSdkArgsToken(asPath.split('#')[1]) ?? '',
    bootstrapData,
    locale,
    publicKey: obKey,
  };
};

export default getQueryArgs;
