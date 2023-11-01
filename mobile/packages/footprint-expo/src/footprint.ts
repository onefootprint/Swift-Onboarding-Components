import * as WebBrowser from 'expo-web-browser';
import queryString from 'query-string';
import { Platform } from 'react-native';

import { OpenFootprint } from './footprint.types';
import getURL from './utils/create-url';

const getDeepLink = (baseScheme?: string) => {
  let scheme = 'footprint';
  if (Platform.OS === 'android' && baseScheme) {
    scheme = baseScheme;
  }
  return Platform.OS === 'android' ? `${scheme}://callback/` : `${scheme}://`;
};

const open = async ({
  scheme,
  appearance,
  publicKey,
  userData,
  onCanceled,
  onCompleted,
  options,
  l10n,
}: OpenFootprint) => {
  const deepLink = getDeepLink(scheme);
  const url = getURL({
    publicKey,
    userData,
    appearance,
    redirectUrl: deepLink,
    options,
    l10n,
  });
  try {
    const result = await WebBrowser.openAuthSessionAsync(url, deepLink);
    if (result.type === 'success' && result.url) {
      const search = result.url.replace(deepLink, '');
      const urlParams = queryString.parse(search);
      onCompleted?.(urlParams.validation_token as string);
    } else {
      onCanceled?.();
    }
  } catch (error) {
    console.error(error);
  }
};

const close = () => {
  return WebBrowser.dismissBrowser();
};

const footprint = {
  open,
  close,
};

export default footprint;
