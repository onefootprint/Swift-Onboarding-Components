import { useQuery } from '@tanstack/react-query';

import { DEBUG_HANDOFF_URL, IS_DEV } from '@/config/constants';

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

const useAuthToken = (deepLinkUrl = '') => {
  const debugUrl = IS_DEV ? DEBUG_HANDOFF_URL : undefined;
  const url = debugUrl || deepLinkUrl;
  return useQuery({
    queryKey: ['token', url],
    queryFn: () => getToken(url),
  });
};

export default useAuthToken;
