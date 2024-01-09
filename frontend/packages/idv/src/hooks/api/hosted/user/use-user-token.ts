import request from '@onefootprint/request';
import type { UserTokenRequest, UserTokenResponse } from '@onefootprint/types';
import { AUTH_HEADER } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';

const userToken = async (payload: UserTokenRequest) => {
  const { authToken } = payload;
  const response = await request<UserTokenResponse>({
    method: 'GET',
    url: '/hosted/user/token',
    headers: {
      [AUTH_HEADER]: authToken,
    },
  });

  return response.data;
};

const useUserToken = (
  { authToken }: UserTokenRequest,
  options: {
    onSuccess?: (response: UserTokenResponse) => void;
    onError?: (error: unknown) => void;
  } = {},
) =>
  useQuery(['token', authToken], () => userToken({ authToken }), {
    enabled: !!authToken,
    onSuccess: options.onSuccess,
    onError: options.onError,
  });

export default useUserToken;
