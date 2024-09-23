import { getLogger, isObject, isStringValid } from '@onefootprint/idv';
import isBoolean from 'lodash/isBoolean';

import type { FootprintPublicEvent } from '@onefootprint/footprint-js';
import type { WebViewAdapterReturn } from '../types';

const { logError, logTrack } = getLogger({ location: 'auth-webview' });

const generateWebViewAdapter = (): WebViewAdapterReturn => {
  let isAdapterLoaded = false;
  let isLocationAlreadySet = false;

  const getRedirectUrl = () => {
    const params = new URLSearchParams(document.location.search);
    return params.get('redirect_url');
  };

  const setLocation = (data: Record<string, string | boolean> = {}) => {
    if (isLocationAlreadySet) {
      return;
    }

    const params = new URLSearchParams();
    const dataEntries = Object.entries(data);
    const paramKeys = dataEntries.map(([key]) => key).join(',');
    const redirectUrl: string | null = getRedirectUrl();

    if (!redirectUrl) {
      console.error('No redirect_url provided');
      logError('No redirect_url provided');
    }

    logTrack(`Redirecting with the following params keys: ${paramKeys}`);

    dataEntries.forEach(([key, value]) => {
      params.set(key, String(value));
    });
    isLocationAlreadySet = true;
    window.location.href = `${redirectUrl}?${params.toString()}`;
  };

  return {
    getAdapterKind: () => 'webview',
    getAdapterResponse: () => null,
    getLoadingStatus: () => isAdapterLoaded,
    getRedirectUrl,
    load: () => {
      logTrack('Loaded the webview adapter');
      return Promise.resolve().then(() => {
        isAdapterLoaded = true;
      });
    },
    on: () => () => undefined,
    send: (event: `${FootprintPublicEvent}`, data?: unknown) => {
      if (event === 'completed' && isStringValid(data)) {
        return setLocation({ completed: true, validation_token: data });
      }

      const dataEntries = Object.entries(isObject(data) ? data : {});
      const dataObj = Object.fromEntries(
        dataEntries.filter(([key, value]) => key && (isStringValid(value) || isBoolean(value))),
      ) as Record<string, string | boolean>;

      setLocation({ ...dataObj, [event]: true });
    },
  };
};

export default generateWebViewAdapter;
