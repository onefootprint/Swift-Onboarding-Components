import queryString from 'query-string';
import { Platform } from 'react-native';
import { InAppBrowser } from 'react-native-inappbrowser-reborn';

import type { FootprintVerifyProps } from './footprint.types';
import type { SessionResult } from './types';
import createUrl from './utils/create-url';
import { logError, logWarn } from './utils/logger';
import sendSdkArgs from './utils/send-sdk-args';

const getDeepLink = () => {
  const scheme = 'footprint';
  return Platform.OS === 'android' ? `${scheme}://callback/` : `${scheme}://`;
};

const footprint = () => {
  let isOpen = false;
  InAppBrowser.warmup(); // Async, can be called multiple times. Speeds up android implementation.

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

    try {
      const result = await startBrowserSession(props, token);
      if (!result) {
        handleBrowserSessionEnd(props, {
          kind: 'error',
          error: 'InAppBrowser is not available.',
        });
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
  };

  const close = () => {
    isOpen = false;
    dismissBrowser();
  };

  const dismissBrowser = () => {
    try {
      InAppBrowser.close();
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
        const errorMessage = logError(result.error);
        props.onError?.(errorMessage);
        break;
      }
    }
  };

  const handleBrowserUrlChange = (props: FootprintVerifyProps, url: string) => {
    if (!url) {
      logWarn('Missing result URL.');
      handleBrowserSessionEnd(props, { kind: 'cancel' });
      return;
    }

    const deepLink = getDeepLink();
    const search = url.replace(deepLink, '');
    const urlParams = queryString.parse(search);
    if (urlParams.canceled) {
      handleBrowserSessionEnd(props, { kind: 'cancel' });
      return;
    }

    const validationToken = urlParams.validation_token;
    if (!validationToken || typeof validationToken !== 'string') {
      logWarn('Missing validation token.');
      handleBrowserSessionEnd(props, { kind: 'cancel' });
      return;
    }

    handleBrowserSessionEnd(props, { kind: 'complete', validationToken });
  };

  const startBrowserSession = async (
    props: FootprintVerifyProps,
    token: string,
  ) => {
    const deepLink = getDeepLink();
    const url = createUrl({
      appearance: props.appearance,
      redirectUrl: deepLink,
      token,
    });

    const isAvailable = await InAppBrowser.isAvailable();
    if (!isAvailable) {
      return undefined;
    }

    const result = await InAppBrowser.openAuth(url, deepLink, {
      ephemeralWebSession: true, // To prevent sharing cookies & permission popup
    });
    return result;
  };

  return {
    open,
    close,
  };
};

export default footprint();
