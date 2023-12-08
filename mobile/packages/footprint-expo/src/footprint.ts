import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import type { OpenFootprint } from './footprint.types';
import createUrl from './utils/create-url';
import sendSdkArgs from './utils/send-sdk-args';

const open = async ({
  redirectUrl,
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
    console.error('@onefootprint/footprint-expo: Unable to get sdk args token');
    return;
  }

  const url = createUrl({
    appearance,
    redirectUrl,
    token,
  });

  try {
    const result = await WebBrowser.openAuthSessionAsync(url, redirectUrl);
    if (result.type !== 'success') {
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

    const { queryParams } = Linking.parse(result.url);
    const isCanceled = !queryParams || queryParams.canceled;
    if (isCanceled) {
      onCanceled?.();
      return;
    }
    const validationToken = queryParams.validation_token;
    if (!validationToken || typeof validationToken !== 'string') {
      console.warn('@onefootprint/footprint-expo: missing validation token');
      onCanceled?.();
      return;
    }

    onCompleted?.(validationToken);
  } catch (error) {
    console.error(`@onefootprint/footprint-expo: ${error}`);
    onCanceled?.();
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
