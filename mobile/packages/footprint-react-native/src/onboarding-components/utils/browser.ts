import queryString from 'query-string';
import { Platform } from 'react-native';
import { InAppBrowser } from 'react-native-inappbrowser-reborn';

import { type OnboardingProps, OnboardingStep } from '../../types';
import createUrl from '../../utils/create-url';
import { logError, logWarn } from '../../utils/logger';
import sendSdkArgs from '../../utils/send-sdk-args';

const LOGGER_PREFIX = 'onboarding-components (RN)';

const getDeepLink = () => {
  const scheme = 'footprint';
  return Platform.OS === 'android' ? `${scheme}://callback/` : `${scheme}://`;
};

const footprint = () => {
  let isOpen = false;

  const handleError = (props: OnboardingProps, error: string) => {
    closeWebView();
    const errorMessage = logError(error);
    props.onError?.(`${LOGGER_PREFIX}: ${errorMessage}`);
  };

  const handleCancel = (props: OnboardingProps) => {
    closeWebView();
    props.onCancel?.();
  };

  const handleComplete = (props: OnboardingProps, validationToken: string) => {
    closeWebView();
    props.onComplete?.(validationToken);
  };

  const handleAuthComplete = (
    props: OnboardingProps,
    { authToken, vaultingToken }: { authToken: string; vaultingToken: string },
  ) => {
    closeWebView();
    props.onAuthComplete?.({
      authToken,
      vaultingToken,
    });
  };

  const render = async (props: OnboardingProps) => {
    if (isOpen) {
      logWarn('Footprint is already open.');
      return;
    }
    isOpen = true;

    const token = await sendSdkArgs(
      {
        publicKey: props.publicKey,
        authToken: props.authToken,
        bootstrapData: props.bootstrapData,
        options: props.options,
        l10n: props.l10n,
      },
      { isComponentSdk: true },
    );
    if (!token) {
      handleError(props, 'Unable to get SDK args token.');
      return;
    }
    try {
      const result = await openWebView(props, token);
      if (result.type !== 'success') {
        // Triggered if user closes the web browser
        handleCancel(props);
      } else {
        handleWebViewUrlChange(props, result.url);
      }
    } catch (error) {
      handleError(props, `${error}`);
    }
  };

  const init = (props: OnboardingProps) => {
    InAppBrowser.warmup();
    return {
      render: () => render(props),
    };
  };

  const destroy = () => {
    closeWebView();
  };

  const handleWebViewUrlChange = (props: OnboardingProps, url: string) => {
    const { step } = props;
    if (!url) {
      logWarn(`${LOGGER_PREFIX}: Missing result URL.`);
      handleCancel(props);
      return;
    }

    const deepLink = getDeepLink();
    const search = url.replace(deepLink, '');
    const urlParams = queryString.parse(search);
    if (urlParams.canceled) {
      handleCancel(props);
      return;
    }

    if (step === OnboardingStep.Auth) {
      const authToken = urlParams.auth_token;
      const vaultingToken = urlParams.components_vault_token;
      if (!authToken || typeof authToken !== 'string') {
        logError(`${LOGGER_PREFIX}: Missing auth token after auth step.`);
        handleError(props, 'User authetication failed - missing auth token');
        return;
      }
      if (!vaultingToken || typeof vaultingToken !== 'string') {
        logError(`${LOGGER_PREFIX}: Missing vaulting token after auth step.`);
        handleError(props, 'User authetication failed - missing auth token');
        return;
      }
      handleAuthComplete(props, {
        authToken,
        vaultingToken: vaultingToken as string,
      });
      return;
    }

    const validationToken = urlParams.validation_token;
    if (!validationToken || typeof validationToken !== 'string') {
      logWarn(`${LOGGER_PREFIX}: Missing validation token.`);
      handleCancel(props);
      return;
    }
    handleComplete(props, validationToken);
  };

  const openWebView = async (props: OnboardingProps, token: string) => {
    const deepLink = getDeepLink();
    const url = createUrl({
      appearance: props.appearance,
      l10n: props.l10n,
      redirectUrl: deepLink,
      token,
    });

    const isAvailable = await InAppBrowser.isAvailable();
    if (!isAvailable) {
      throw new Error('InAppBrowser is not available.');
    }
    const result = await InAppBrowser.openAuth(url, deepLink, {
      ephemeralWebSession: true, // To prevent sharing cookies & permission popup
    });
    return result;
  };

  const closeWebView = () => {
    isOpen = false;
    try {
      InAppBrowser.close();
    } catch (_) {
      // do nothing
    }
  };

  return {
    init,
    destroy,
  };
};

export default footprint();
