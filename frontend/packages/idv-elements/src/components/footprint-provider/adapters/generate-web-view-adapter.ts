import type { CompletePayload, FootprintClientGenerator } from '../types';

const generateWebView: FootprintClientGenerator = () => {
  const getRedirectUrl = () => {
    const params = new URLSearchParams(document.location.search);
    return params.get('redirect_url');
  };

  const setLocation = (data: Record<string, unknown> = {}) => {
    const params = new URLSearchParams();
    Object.entries(data).forEach(([key, value]) => {
      params.set(key, value as string);
    });
    window.location.href = `${getRedirectUrl()}?${params.toString()}`;
  };

  const load = (): Promise<void> => Promise.resolve();

  const close = (): void => {
    setLocation({ canceled: true });
  };

  const cancel = (): void => {
    setLocation({ canceled: true });
  };

  const on = () => () => {};

  const complete = ({ validationToken }: CompletePayload): void => {
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

export default generateWebView;
