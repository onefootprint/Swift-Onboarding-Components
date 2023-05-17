import { useQuery } from '@tanstack/react-query';
import * as Linking from 'expo-linking';

import { DEBUG_HANDOFF_URL } from '@/domains/app-clip/config/constants';

const getToken = (url?: string) => {
  if (!url) {
    throw new Error('No URL provided');
  }
  const parts = url.split('#');
  if (parts.length <= 1) {
    throw new Error('Invalid URL format');
  }
  const [, authToken] = parts;
  return { authToken: decodeURI(authToken) };
};

const useParseHandoffUrl = () => {
  const linkingUrl = Linking.useURL();
  const debugUrl = DEBUG_HANDOFF_URL;
  const url = debugUrl || linkingUrl;
  return useQuery(['token'], () => getToken(url));
};

export default useParseHandoffUrl;
