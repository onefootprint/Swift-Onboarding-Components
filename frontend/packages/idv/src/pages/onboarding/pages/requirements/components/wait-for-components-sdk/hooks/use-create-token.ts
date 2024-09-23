import request from '@onefootprint/request';
import type { CreateUserTokenRequest, CreateUserTokenResponse } from '@onefootprint/types';
import { AUTH_HEADER } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

const createTokenRequest = async (payload: CreateUserTokenRequest) => {
  const { authToken, ...data } = payload;
  const response = await request<CreateUserTokenResponse>({
    method: 'POST',
    url: '/hosted/user/tokens',
    data,
    headers: {
      [AUTH_HEADER]: authToken,
    },
  });
  return response.data;
};

const useCreateToken = () =>
  useMutation({
    mutationFn: createTokenRequest,
  });

export default useCreateToken;
