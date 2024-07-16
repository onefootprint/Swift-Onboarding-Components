import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import type { ComponentProps } from './types';
import createUrl from './utils/create-url';
import { logError, logWarn } from './utils/logger';
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

    const token = await sendSdkArgs({
      publicKey: props.publicKey,
      authToken: props.authToken,
      bootstrapData: props.bootstrapData,
      options: props.options,
      l10n: props.l10n,
    });
    if (!token) {
      handleError(props, 'Unable to get SDK args token.');
      return;
    }

    // Only handle once either via listener or via openAuthSessionAsync result.
    let isUpdateHandled = false;
    const subscription = Linking.addEventListener('url', ({ url: eventUrl }) => {
      if (!isUpdateHandled) {
        isUpdateHandled = true;
        handleWebViewUrlChange(props, eventUrl);
        subscription.remove();
      }
    });

    try {
      const result = await openWebView(props, token);
      if (isUpdateHandled) {
        subscription.remove();
        return;
      }

      if (result.type !== 'success') {
        // Triggered if user closes the web browser
        handleCancel(props);
      } else {
        handleWebViewUrlChange(props, result.url);
      }
    } catch (error) {
      handleError(props, `${error}`);
    }

    subscription.remove();
  };

  const init = (props: ComponentProps) => {
    WebBrowser.warmUpAsync();
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

    const { queryParams } = Linking.parse(url);
    const isCanceled = !queryParams || queryParams.canceled;

    if (isCanceled) {
      handleCancel(props);
      return;
    }

    const validationToken = queryParams.validation_token;
    if (validationToken && typeof validationToken === 'string') {
      handleComplete(props, validationToken);
    } else {
      logWarn('Missing validation token.');
      handleCancel(props);
    }
  };

  const openWebView = async (props: ComponentProps, token: string) => {
    // If redirectUrl is not provided, return to the root of the app when flow is done
    const redirectUrlOrFallback = props.redirectUrl ?? Linking.createURL('/');
    const url = createUrl({
      appearance: props.appearance,
      l10n: props.l10n,
      redirectUrl: redirectUrlOrFallback,
      token,
    });
    const result = await WebBrowser.openAuthSessionAsync(url, redirectUrlOrFallback, { preferEphemeralSession: true });
    return result;
  };

  const closeWebView = () => {
    isOpen = false;
    try {
      WebBrowser.dismissAuthSession();
      WebBrowser.dismissBrowser();
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
