import * as WebBrowser from 'expo-web-browser';
import queryString from 'query-string';
import { Platform } from 'react-native';

import type { OpenFootprint } from './footprint.types';
import createUrl from './utils/create-url';
import sendSdkArgs from './utils/send-sdk-args';

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
  const token = await sendSdkArgs({
    publicKey,
    userData,
    options,
    l10n,
  });
  if (!token) {
    return;
  }

  const deepLink = getDeepLink(scheme);
  const url = createUrl({
    appearance,
    redirectUrl: deepLink,
    token,
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
