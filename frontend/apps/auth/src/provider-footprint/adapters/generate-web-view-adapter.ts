import { getLogger } from '@onefootprint/idv';

import type { WebViewAdapterReturn } from '../types';

const { logTrack } = getLogger({ location: 'auth-webview' });

const generateWebViewAdapter = (): WebViewAdapterReturn => {
  let isAdapterLoaded = false;
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

  return {
    getAdapterResponse: () => null,
    getLoadingStatus: () => isAdapterLoaded,
    load: () =>
      Promise.resolve().then(() => {
        isAdapterLoaded = true;
      }),
    on: () => () => undefined,
    send: (event: string) => {
      logTrack(`The ${event} event has been dispatched`);
      setLocation({ [event]: true });
    },
  };
};

export default generateWebViewAdapter;
