import * as Linking from 'expo-linking';
import { useEffect } from 'react';

import { DEBUG_HANDOFF_URL } from '@/domains/app-clip/config/constants';

const useParseHandoffUrl = (callbacks: {
  onSuccess: (authToken) => void;
  onError: () => void;
}) => {
  const linkingUrl = Linking.useURL();
  const debugUrl = DEBUG_HANDOFF_URL;
  const url = debugUrl || linkingUrl;

  useEffect(() => {
    if (url) {
      const parts = url.split('#');
      if (parts.length <= 1) {
        callbacks.onError();
      } else {
        const [, authToken] = parts;
        callbacks.onSuccess?.(decodeURI(authToken));
      }
    }
  }, [url]);
};

export default useParseHandoffUrl;
