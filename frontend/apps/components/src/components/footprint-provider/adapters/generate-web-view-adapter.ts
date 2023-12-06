import type { FootprintClientGenerator } from '../types';

const generateWebViewAdapter: FootprintClientGenerator = () => {
  const getRedirectUrl = () => {
    const params = new URLSearchParams(document.location.search);
    return params.get('redirect_url');
  };

  const setLocation = (data: Record<string, string | boolean> = {}) => {
    const params = new URLSearchParams();
    Object.entries(data).forEach(([key, value]) => {
      params.set(key, value as string);
    });
    window.location.href = `${getRedirectUrl()}?${params.toString()}`;
  };

  const load = (): Promise<void> => Promise.resolve();

  const send = (event: string) => {
    setLocation({ [event]: true });
  };

  const on = () => () => {};

  return {
    on,
    send,
    load,
  };
};

export default generateWebViewAdapter;
