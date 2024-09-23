import request from '@onefootprint/request';
import type { UserTokenRequest, UserTokenResponse } from '@onefootprint/types';
import { AUTH_HEADER } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

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
) => {
  const query = useQuery({
    queryKey: ['token', authToken],
    queryFn: () => userToken({ authToken }),
    enabled: !!authToken,
  });

  useEffect(() => {
    if (query.isSuccess && options.onSuccess) {
      options.onSuccess(query.data);
    }
    if (query.isError && options.onError) {
      options.onError(query.error);
    }
    // no onSuccess or onError because likely to trigger infinite re-render/loop
  }, [query.isSuccess, query.isError, query.data, query.error]);

  return query;
};

export default useUserToken;
