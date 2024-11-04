import { getLogger } from '@/idv/utils';
import type { CompletePayload, SendResultCallback, WebViewAdapterReturn } from '../types';

const { logError, logInfo, logTrack } = getLogger({ location: 'idv-webview' });

const generateWebViewAdapter = (): WebViewAdapterReturn => {
  let sendResultCallback: SendResultCallback | undefined;

  const setSendResultCallback = (callback: SendResultCallback) => {
    sendResultCallback = callback;
  };

  const getRedirectUrl = () => {
    const params = new URLSearchParams(document.location.search);
    const redirectUrl = params.get('redirect_url');

    if (!redirectUrl) {
      console.log('No redirect_url provided');
      logError('No redirect_url provided');
    }

    return redirectUrl;
  };

  const setLocation = (data: Record<string, unknown> = {}) => {
    const params = new URLSearchParams();
    const dataEntries = Object.entries(data);
    const paramKeys = dataEntries.map(([key, _value]) => key).join(',');

    logTrack(`Redirecting with the following params keys: ${paramKeys}`);

    dataEntries.forEach(([key, value]) => {
      params.set(key, value as string);
    });
    window.location.href = `${getRedirectUrl()}?${params.toString()}`;
  };

  const load = (): Promise<void> => {
    logInfo('Loading footprint from web view adapter');
    return Promise.resolve();
  };

  const close = (): void => {
    logInfo('Closing footprint from web view adapter');
    setLocation({ canceled: true });
  };

  const cancel = (): void => {
    logInfo('Canceling footprint from web view adapter');
    setLocation({ canceled: true });
  };

  const on = () => () => undefined;

  const setCompleteTimeout = (location: Record<string, string>, delay = 0) => {
    setTimeout(() => {
      logInfo('Closing footprint after complete timeout from web view adapter');
      setLocation(location);
    }, delay);
  };

  const complete = ({ validationToken, delay = 0, authToken, deviceResponse }: CompletePayload): void => {
    logInfo('Completing footprint from web view adapter');
    const location: Record<string, string> = {
      validation_token: validationToken,
    };
    if (authToken && deviceResponse && sendResultCallback) {
      sendResultCallback(authToken, deviceResponse)
        .then(token => {
          if (token) {
            location.sdk_args_token = token;
          }
        })
        .finally(() => {
          setCompleteTimeout(location, delay);
        });
    } else {
      setCompleteTimeout(location, delay);
    }
  };

  const relayToComponents = (response: { authToken: string; vaultingToken: string }) => {
    logInfo('Completing auth footprint from web view adapter');
    const location: Record<string, string> = {
      auth_token: response.authToken,
      components_vault_token: response.vaultingToken,
    };
    setLocation(location);
  };

  return {
    auth: () => undefined,
    relayToComponents: relayToComponents,
    setSendResultCallback,
    load,
    cancel,
    close,
    complete,
    on,
  };
};

export default generateWebViewAdapter;
