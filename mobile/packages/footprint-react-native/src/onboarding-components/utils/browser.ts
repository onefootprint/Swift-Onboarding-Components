import queryString from 'query-string';
import { Platform } from 'react-native';
import { InAppBrowser } from 'react-native-inappbrowser-reborn';

import type { FootprintVerifyProps } from '../../footprint.types';
import type { SessionResult } from '../../types';
import createUrl from '../../utils/create-url';
import { logError, logWarn } from '../../utils/logger';
import sendSdkArgs from '../../utils/send-sdk-args';

const LOGGER_PREFIX = 'onboarding-components (RN)';

const getDeepLink = () => {
  const scheme = 'footprint';
  return Platform.OS === 'android' ? `${scheme}://callback/` : `${scheme}://`;
};

type OnboardingProps = FootprintVerifyProps & {
  step: 'auth' | 'onboard';
  onAuthComplete?: (tokens: {
    authToken: string;
    vaultingToken: string;
  }) => void;
};

const footprint = () => {
  let isOpen = false;
  InAppBrowser.warmup(); // Async, can be called multiple times. Speeds up android implementation.

  const open = async (props: OnboardingProps) => {
    if (isOpen) {
      return;
    }
    isOpen = true;

    const token = await sendSdkArgs(
      {
        publicKey: props.publicKey,
        authToken: props.authToken,
        userData: props.userData,
        options: props.options,
        l10n: props.l10n,
      },
      { isComponentSdk: true },
    );
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
    props: OnboardingProps,
    result: SessionResult,
  ) => {
    isOpen = false;
    dismissBrowser();

    switch (result.kind) {
      case 'auth_complete': {
        props.onAuthComplete?.({
          authToken: result.authToken,
          vaultingToken: result.vaultingToken,
        });
        break;
      }
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
        props.onError?.(`${LOGGER_PREFIX}: ${errorMessage}`);
        break;
      }
    }
  };

  const handleBrowserUrlChange = (props: OnboardingProps, url: string) => {
    const { step } = props;
    if (!url) {
      logWarn(`${LOGGER_PREFIX}: Missing result URL.`);
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

    if (step === 'auth') {
      const authToken = urlParams.auth_token;
      const vaultingToken = urlParams.downscoped_auth_token;
      if (!authToken || typeof authToken !== 'string') {
        logError(`${LOGGER_PREFIX}: Missing auth token after auth step.`);
        handleBrowserSessionEnd(props, {
          kind: 'error',
          error: 'User authetication failed - missing auth token',
        });
        return;
      }
      if (!vaultingToken || typeof vaultingToken !== 'string') {
        logError(`${LOGGER_PREFIX}: Missing vaulting token after auth step.`);
        handleBrowserSessionEnd(props, {
          kind: 'error',
          error: 'User authetication failed - missing vaulting token',
        });
        return;
      }
      handleBrowserSessionEnd(props, {
        kind: 'auth_complete',
        authToken,
        vaultingToken,
      });
      return;
    }

    const validationToken = urlParams.validation_token;
    if (!validationToken || typeof validationToken !== 'string') {
      logWarn(`${LOGGER_PREFIX}: Missing validation token.`);
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
      l10n: props.l10n,
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
