import queryString from 'query-string';
import { InAppBrowser } from 'react-native-inappbrowser-reborn';

import type { ComponentProps } from './types';
import createUrl from './utils/create-url';
import { logError, logInfo, logWarn } from './utils/logger';
import sendSdkArgs from './utils/send-sdk-args';

const footprint = () => {
  let isOpen = false;

  const handleError = (props: ComponentProps, error: string) => {
    closeWebView();
    const errorMessage = logError(error);
    props.onError?.(errorMessage);
  };

  const handleCancel = (props: ComponentProps) => {
    closeWebView();
    props.onCancel?.();
  };

  const handleComplete = (props: ComponentProps, validationToken: string) => {
    closeWebView();
    props.onComplete?.(validationToken);
  };

  const render = async (props: ComponentProps) => {
    if (isOpen) {
      logWarn('Footprint is already open.');
      return;
    }
    isOpen = true;
    const sdkArgs = {
      publicKey: props.publicKey,
      authToken: props.authToken,
      bootstrapData: props.bootstrapData,
      options: props.options,
      l10n: props.l10n,
      sandboxId: props.sandboxId,
      sandboxOutcome: props.sandboxOutcome,
    };
    logInfo(`Sending SDK args to Footprint's server. Public key is ${props.publicKey}.`);
    const token = await sendSdkArgs(sdkArgs);
    if (!token) {
      handleError(props, 'Unable to get SDK args token.');
      return;
    }

    try {
      const result = await openWebView(props, token);
      if (result.type !== 'success') {
        // Triggered if user closes the web browser
        logWarn('User closed the web view.');
        handleCancel(props);
      } else {
        handleWebViewUrlChange(props, result.url);
      }
    } catch (error) {
      handleError(props, `${error}`);
    }
  };

  const init = (props: ComponentProps) => {
    InAppBrowser.warmup();
    return {
      render: () => render(props),
    };
  };

  const destroy = () => {
    closeWebView();
  };

  const handleWebViewUrlChange = (props: ComponentProps, url: string) => {
    if (!url) {
      logWarn('Missing result URL.');
      handleCancel(props);
      return;
    }
    logInfo('Handling URL redirection');

    const deepLink = props.redirectUrl;
    const search = url.replace(deepLink, '');
    const urlParams = queryString.parse(search);
    if (urlParams.canceled) {
      handleCancel(props);
      return;
    }

    const validationToken = urlParams.validation_token;
    if (validationToken && typeof validationToken === 'string') {
      handleComplete(props, validationToken);
    } else {
      logWarn('Missing validation token.');
      handleCancel(props);
    }
  };

  const openWebView = async (props: ComponentProps, token: string) => {
    const deepLink = props.redirectUrl;
    const url = createUrl({
      appearance: props.appearance,
      l10n: props.l10n,
      redirectUrl: deepLink,
      token,
    });
    logInfo("Opening Footprint's web view");
    const isAvailable = await InAppBrowser.isAvailable();
    if (!isAvailable) {
      logError('InAppBrowser is not available.');
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
