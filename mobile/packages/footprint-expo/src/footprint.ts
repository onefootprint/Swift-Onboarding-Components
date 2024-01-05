import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import type { FootprintVerifyProps } from './footprint.types';
import type { SessionResult } from './types';
import createUrl from './utils/create-url';
import { logError, logWarn } from './utils/logger';
import sendSdkArgs from './utils/send-sdk-args';

const footprint = () => {
  let isOpen = false;
  WebBrowser.warmUpAsync(); // Async, can be called multiple times. Speeds up android implementation.

  const open = async (props: FootprintVerifyProps) => {
    if (isOpen) {
      return;
    }
    isOpen = true;

    const token = await sendSdkArgs({
      publicKey: props.publicKey,
      authToken: props.authToken,
      userData: props.userData,
      options: props.options,
      l10n: props.l10n,
    });
    if (!token) {
      handleBrowserSessionEnd(props, {
        kind: 'error',
        error: 'Unable to get SDK args token.',
      });
      return;
    }

    // Only handle once either via listener or via openAuthSessionAsync result.
    let isUpdateHandled = false;
    const subscription = Linking.addEventListener(
      'url',
      ({ url: eventUrl }) => {
        if (!isUpdateHandled) {
          isUpdateHandled = true;
          handleBrowserUrlChange(props, eventUrl);
          subscription.remove();
        }
      },
    );

    try {
      const result = await startBrowserSession(props, token);
      if (isUpdateHandled) {
        subscription.remove();
        return;
      }

      if (result.type !== 'success') {
        // Triggered if user closes the web browser
        handleBrowserSessionEnd(props, { kind: 'cancel' });
      } else {
        handleBrowserUrlChange(props, result.url);
      }
    } catch (error) {
      handleBrowserSessionEnd(props, { kind: 'error', error: `${error}` });
    }

    subscription.remove();
  };

  const close = () => {
    isOpen = false;
    dismissBrowser();
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

  const handleBrowserSessionEnd = (
    props: FootprintVerifyProps,
    result: SessionResult,
  ) => {
    isOpen = false;
    dismissBrowser();

    switch (result.kind) {
      case 'complete': {
        props.onComplete?.(result.validationToken);
        break;
      }
      case 'cancel': {
        props.onCancel?.();
        break;
      }
      case 'error': {
        const errorMessage = logError(props, result.error);
        props.onError?.(errorMessage);
        break;
      }
    }
  };

  const handleBrowserUrlChange = (props: FootprintVerifyProps, url: string) => {
    if (!url) {
      logWarn(props, 'Missing result URL.');
      handleBrowserSessionEnd(props, { kind: 'cancel' });
      return;
    }

    const { queryParams } = Linking.parse(url);
    const isCanceled = !queryParams || queryParams.canceled;
    if (isCanceled) {
      handleBrowserSessionEnd(props, { kind: 'cancel' });
      return;
    }
    const validationToken = queryParams.validation_token;
    if (!validationToken || typeof validationToken !== 'string') {
      logWarn(props, 'Missing validation token.');
      handleBrowserSessionEnd(props, { kind: 'cancel' });
      return;
    }

    handleBrowserSessionEnd(props, { kind: 'complete', validationToken });
  };

  const startBrowserSession = async (
    props: FootprintVerifyProps,
    token: string,
  ) => {
    // If redirectUrl is not provided, return to the root of the app when flow is done
    const redirectUrlOrFallback = props.redirectUrl ?? Linking.createURL('/');
    const url = createUrl({
      appearance: props.appearance,
      redirectUrl: redirectUrlOrFallback,
      token,
    });
    const result = await WebBrowser.openAuthSessionAsync(
      url,
      redirectUrlOrFallback,
      { preferEphemeralSession: true }, // To prevent sharing cookies & permission popup
    );
    return result;
  };

  return {
    open,
    close,
  };
};

export default footprint();
