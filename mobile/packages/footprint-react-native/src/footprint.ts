import queryString from 'query-string';
import { Platform } from 'react-native';
import { InAppBrowser } from 'react-native-inappbrowser-reborn';

import type { FootprintVerifyProps } from './footprint.types';
import createUrl from './utils/create-url';
import sendSdkArgs from './utils/send-sdk-args';
import logError from './utils/logger';

const getDeepLink = (baseScheme?: string) => {
  let scheme = 'footprint';
  if (Platform.OS === 'android' && baseScheme) {
    scheme = baseScheme;
  }
  return Platform.OS === 'android' ? `${scheme}://callback/` : `${scheme}://`;
};

const open = async (props: FootprintVerifyProps) => {
  const {
    appearance,
    publicKey,
    authToken,
    userData,
    onCancel,
    onComplete,
    options,
    l10n,
  } = props;

  const sdkArgsData = {
    publicKey,
    authToken,
    userData,
    options,
    l10n,
  };
  const token = await sendSdkArgs(sdkArgsData, (error: string) => {
    logError(props, error);
  });
  if (!token) {
    logError(props, 'Unable to get SDK args token.');
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
      onComplete?.(urlParams.validation_token as string);
    } else {
      onCancel?.();
    }
  } catch (error) {
    logError(props, error);
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
