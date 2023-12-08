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

  const cancel = () => {
    try {
      WebBrowser.dismissAuthSession();
      WebBrowser.dismissBrowser();
    } catch (error) {
      /* noop */
    }
    onCanceled?.();
  };

  let isUpdateHandled = false; // Android and iOS handle results differently.
  const subscription = Linking.addEventListener('url', ({ url: eventUrl }) => {
    if (isUpdateHandled) {
      return;
    }
    isUpdateHandled = true;
    handleResultUrl(eventUrl);
  });

  const handleResultUrl = (resultUrl: string) => {
    if (!resultUrl) {
      console.warn('@onefootprint/footprint-expo: missing result url');
      cancel();
      return;
    }

    const { queryParams } = Linking.parse(resultUrl);
    const isCanceled = !queryParams || queryParams.canceled;
    if (isCanceled) {
      cancel();
      return;
    }
    const validationToken = queryParams.validation_token;
    if (!validationToken || typeof validationToken !== 'string') {
      console.warn('@onefootprint/footprint-expo: missing validation token');
      cancel();
      return;
    }

    onCompleted?.(validationToken);
  };

  try {
    const url = createUrl({
      appearance,
      redirectUrl: redirectUrl ?? Linking.createURL('/'),
      token,
    });
    const result = await WebBrowser.openAuthSessionAsync(url);
    if (!isUpdateHandled) {
      if (result.type !== 'success') {
        cancel();
      } else {
        handleResultUrl(result.url);
      }
    }
  } catch (error) {
    console.error(`@onefootprint/footprint-expo: ${error}`);
    cancel();
  }

  subscription.remove();
};

const close = () => {
  return WebBrowser.dismissBrowser();
};

const footprint = {
  open,
  close,
};

export default footprint;
