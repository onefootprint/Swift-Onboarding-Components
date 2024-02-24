import Logger from '../../../utils/logger';
import type { CompletePayload, WebViewAdapterReturn } from '../types';

const generateWebViewAdapter = (): WebViewAdapterReturn => {
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

  const on = () => () => {};

  const complete = ({
    validationToken,
    delay = 0,
    authToken,
    deviceResponseJson,
  }: CompletePayload): void => {
    Logger.info('Completing footprint from web view adapter');
    const location: Record<string, string> = {
      validation_token: validationToken,
    };
    if (authToken && deviceResponseJson) {
      location.auth_token = authToken;
      location.device_response = deviceResponseJson;
    }
    setTimeout(() => {
      Logger.info(
        'Closing footprint after complete timeout from web view adapter',
      );
      setLocation(location);
    }, delay);
  };

  return {
    load,
    cancel,
    close,
    complete,
    on,
  };
};

export default generateWebViewAdapter;
