import request from '@onefootprint/request';
import { UserTokenRequest, UserTokenResponse } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

import { AUTH_HEADER } from '../../../../config/constants';

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

const useUserToken = () => useMutation(userToken);

export default useUserToken;
