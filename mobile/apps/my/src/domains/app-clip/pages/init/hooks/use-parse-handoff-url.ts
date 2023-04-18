import * as Linking from 'expo-linking';
import { useEffect } from 'react';

const useParseHandoffUrl = (callbacks: {
  onSuccess: (authToken) => void;
  onError: () => void;
}) => {
  const url = Linking.useURL();

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
