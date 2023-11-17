import Logger from '../../../utils/logger';
import type { CompletePayload, FootprintClientGenerator } from '../types';

const generateWebViewAdapter: FootprintClientGenerator = () => {
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

  const complete = ({ validationToken }: CompletePayload): void => {
    Logger.info('Completing footprint from web view adapter');
    setLocation({ validation_token: validationToken });
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
