import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import type { OpenFootprint } from './footprint.types';
import createUrl from './utils/create-url';
import sendSdkArgs from './utils/send-sdk-args';

const handleWebBrowserUrlChange = (
  url: string,
  onComplete: OpenFootprint['onCompleted'],
  onCancel: OpenFootprint['onCanceled'],
) => {
  if (!url) {
    console.warn('@onefootprint/footprint-expo: missing result url');
    dismissBrowser();
    onCancel?.();
    return;
  }

  const { queryParams } = Linking.parse(url);
  const isCanceled = !queryParams || queryParams.canceled;
  if (isCanceled) {
    dismissBrowser();
    onCancel?.();
    return;
  }
  const validationToken = queryParams.validation_token;
  if (!validationToken || typeof validationToken !== 'string') {
    console.warn('@onefootprint/footprint-expo: missing validation token');
    dismissBrowser();
    onCancel?.();
    return;
  }

  onComplete?.(validationToken);
};

const dismissBrowser = () => {
  // These methods may not be available depending on whether we are on iOS or Android.
  // Will throw error if not available - safe to ignore.
  try {
    WebBrowser.dismissAuthSession();
    WebBrowser.dismissBrowser();
  } catch (error) {
    /* noop */
  }
};

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

  // Only handle once either via listener or via openAuthSessionAsync result.
  let isUpdateHandled = false;
  const subscription = Linking.addEventListener('url', ({ url: eventUrl }) => {
    if (!isUpdateHandled) {
      isUpdateHandled = true;
      handleWebBrowserUrlChange(eventUrl, onCompleted, onCanceled);
    }
  });

  try {
    // If redirectUrl is not provided, return to the root of the app when flow is done
    const redirectUrlOrFallback = redirectUrl ?? Linking.createURL('/');
    const url = createUrl({
      appearance,
      redirectUrl: redirectUrlOrFallback,
      token,
    });
    const result = await WebBrowser.openAuthSessionAsync(
      url,
      redirectUrlOrFallback,
    );
    if (!isUpdateHandled) {
      if (result.type !== 'success') {
        // Triggered if user closes the web browser
        dismissBrowser();
        onCanceled?.();
      } else {
        handleWebBrowserUrlChange(result.url, onCompleted, onCanceled);
      }
    }
  } catch (error) {
    console.error(`@onefootprint/footprint-expo: ${error}`);
    dismissBrowser();
    onCanceled?.();
  }

  subscription.remove();
};

const footprint = {
  open,
  close: dismissBrowser,
};

export default footprint;
