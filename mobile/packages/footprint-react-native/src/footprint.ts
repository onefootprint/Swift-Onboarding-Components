import queryString from 'query-string';
import { Platform } from 'react-native';
import { InAppBrowser } from 'react-native-inappbrowser-reborn';

import type { FootprintVerifyProps } from './footprint.types';
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
  appearance,
  publicKey,
  authToken,
  userData,
  onCanceled,
  onCompleted,
  options,
  l10n,
}: FootprintVerifyProps) => {
  const token = await sendSdkArgs({
    publicKey,
    authToken,
    userData,
    options,
    l10n,
  });
  if (!token) {
    return;
  }

  const deepLink = getDeepLink();
  const url = createUrl({
    appearance,
    redirectUrl: deepLink,
    token,
  });

  try {
    const result = await InAppBrowser.openAuth(url, deepLink);
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
  // return InAppBrowser.close();
};

const footprint = {
  open,
  close,
};

export default footprint;
