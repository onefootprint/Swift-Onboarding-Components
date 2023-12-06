import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import queryString from 'query-string';

import type { OpenFootprint } from './footprint.types';
import createUrl from './utils/create-url';
import sendSdkArgs from './utils/send-sdk-args';

const open = async ({
  scheme = 'footprint',
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

  const deepLink = Linking.createURL(scheme);
  const url = createUrl({
    appearance,
    redirectUrl: deepLink,
    token,
  });

  try {
    const result = await WebBrowser.openAuthSessionAsync(url, deepLink);
    if (result.type !== 'success') {
      console.warn(
        `@onefootprint/footprint-expo: found invalid result type ${result.type}}`,
      );
      onCanceled?.();
      return;
    }
    if (!result.url) {
      console.warn(
        `@onefootprint/footprint-expo: found invalid result url ${result.url}}`,
      );
      onCanceled?.();
      return;
    }

    const search = result.url.replace(deepLink, '');
    const urlParams = queryString.parse(search);
    const validationToken = urlParams.validation_token;
    if (validationToken && typeof validationToken === 'string') {
      onCompleted?.(urlParams.validation_token as string);
    } else {
      onCanceled?.();
    }
  } catch (error) {
    console.error(`@onefootprint/footprint-expo: ${error}`);
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
