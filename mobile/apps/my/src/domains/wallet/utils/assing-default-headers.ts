import { client } from '@onefootprint/request';

import AUTH_HEADER from '@/config/constants';

export const addAuthTokenToRequest = (authToken: string) => {
  client.interceptors.request.use(config => {
    const newConfig = { ...config };
    newConfig.headers[AUTH_HEADER] = authToken;
    return config;
  });
};

export const removeAuthTokenToRequest = () => {
  client.interceptors.request.use(config => {
    const newConfig = { ...config };
    newConfig.headers[AUTH_HEADER] = undefined;
    return config;
  });
};
