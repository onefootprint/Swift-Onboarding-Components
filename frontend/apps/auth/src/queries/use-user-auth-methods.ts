import { isValidTokenFormat } from '@onefootprint/idv';
import request from '@onefootprint/request';
import type { AuthMethodKind } from '@onefootprint/types';
import { AUTH_HEADER } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';

import { isString } from '@/src/utils';

export type UserAuthMethodsResponse = {
  canUpdate: boolean;
  isVerified: boolean;
  kind: AuthMethodKind;
}[];

const FIVE_MINUTES = 1000 * 60 * 5;

const requestFn = async (token: string) => {
  const response = await request<UserAuthMethodsResponse>({
    method: 'GET',
    url: '/hosted/user/auth_methods',
    headers: { [AUTH_HEADER]: token },
  });

  console.log('# response', response); // eslint-disable-line no-console
  return response.data;
};

const useUserAuthMethods = (token?: string) => {
  const isTokenValid = isString(token) && isValidTokenFormat(token);

  return useQuery({
    cacheTime: FIVE_MINUTES,
    enabled: isTokenValid,
    queryFn: () => (isTokenValid ? requestFn(token) : undefined),
    queryKey: [token, 'get-user-auth-methods'],
  });
};

export default useUserAuthMethods;
