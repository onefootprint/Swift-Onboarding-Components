import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import type { FootprintVerifyProps } from './footprint.types';
import createUrl from './utils/create-url';
import sendSdkArgs from './utils/send-sdk-args';
import { logError, logWarn } from './utils/logger';

const handleWebBrowserUrlChange = (
  props: FootprintVerifyProps,
  url: string,
  onComplete: FootprintVerifyProps['onComplete'],
  onCancel: FootprintVerifyProps['onCancel'],
) => {
  if (!url) {
    logWarn(props, 'Missing result URL.');
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
    logWarn(props, 'Missing validation token.');
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

const open = async (props: FootprintVerifyProps) => {
  const {
    redirectUrl,
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

  // Only handle once either via listener or via openAuthSessionAsync result.
  let isUpdateHandled = false;
  const subscription = Linking.addEventListener('url', ({ url: eventUrl }) => {
    if (!isUpdateHandled) {
      isUpdateHandled = true;
      handleWebBrowserUrlChange(props, eventUrl, onComplete, onCancel);
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
        onCancel?.();
      } else {
        handleWebBrowserUrlChange(props, result.url, onComplete, onCancel);
      }
    }
  } catch (error) {
    logError(props, error);
    dismissBrowser();
    onCancel?.();
  }

  subscription.remove();
};

const footprint = {
  open,
  close: dismissBrowser,
};

export default footprint;
