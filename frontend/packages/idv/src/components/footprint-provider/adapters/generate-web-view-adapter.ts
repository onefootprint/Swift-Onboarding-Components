import { Logger } from '../../../utils/logger';
import type { CompletePayload, SendResultCallback, WebViewAdapterReturn } from '../types';

const generateWebViewAdapter = (): WebViewAdapterReturn => {
  let sendResultCallback: SendResultCallback | undefined;

  const setSendResultCallback = (callback: SendResultCallback) => {
    sendResultCallback = callback;
  };

  const getRedirectUrl = () => {
    const params = new URLSearchParams(document.location.search);
    return params.get('redirect_url');
  };

  const setLocation = (data: Record<string, unknown> = {}) => {
    Logger.info('Setting location from web view adapter');
    const params = new URLSearchParams();
    Object.entries(data).forEach(([key, value]) => {
      params.set(key, value as string);
    });
    window.location.href = `${getRedirectUrl()}?${params.toString()}`;
  };

  const load = (): Promise<void> => {
    Logger.info('Loading footprint from web view adapter');
    return Promise.resolve();
  };

  const close = (): void => {
    Logger.info('Closing footprint from web view adapter');
    setLocation({ canceled: true });
  };

  const cancel = (): void => {
    Logger.info('Canceling footprint from web view adapter');
    setLocation({ canceled: true });
  };

  const on = () => () => undefined;

  const setCompleteTimeout = (location: Record<string, string>, delay = 0) => {
    setTimeout(() => {
      Logger.info('Closing footprint after complete timeout from web view adapter');
      setLocation(location);
    }, delay);
  };

  const complete = ({ validationToken, delay = 0, authToken, deviceResponse }: CompletePayload): void => {
    Logger.info('Completing footprint from web view adapter');
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

  const relayToComponents = (componentsVaultToken: string, authToken: string) => {
    Logger.info('Completing auth footprint from web view adapter');
    const location: Record<string, string> = {
      auth_token: authToken,
      components_vault_token: componentsVaultToken,
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
