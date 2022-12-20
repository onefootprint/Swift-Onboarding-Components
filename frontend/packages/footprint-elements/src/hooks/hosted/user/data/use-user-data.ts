import request from '@onefootprint/request';
import { UserDataRequest, UserDataResponse } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

import { AUTH_HEADER } from '../../../../config/constants';

const userDataRequest = async (payload: UserDataRequest) => {
  const response = await request<UserDataResponse>({
    method: 'POST',
    url: '/hosted/user/data/identity',
    data: {
      ...payload.data,
      speculative: !!payload.speculative,
    },
    headers: {
      [AUTH_HEADER]: payload.authToken,
    },
  });
  return response.data;
};

const useUserData = () => useMutation(userDataRequest);

export default useUserData;
