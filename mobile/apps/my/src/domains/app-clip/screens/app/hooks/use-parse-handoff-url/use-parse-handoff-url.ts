import { useQuery } from '@tanstack/react-query';
import * as Linking from 'expo-linking';

import { DEBUG_HANDOFF_URL, IS_DEV } from '@/domains/app-clip/config/constants';

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
  const debugUrl = IS_DEV ? DEBUG_HANDOFF_URL : undefined;
  const url = debugUrl || linkingUrl;
  return useQuery(['token', url], () => getToken(url));
};

export default useParseHandoffUrl;
