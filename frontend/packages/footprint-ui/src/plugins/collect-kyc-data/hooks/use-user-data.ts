import request, { RequestError } from '@onefootprint/request';
import { UserDataRequest, UserDataResponse } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

import { BIFROST_AUTH_HEADER } from '../config/contants';

const userDataRequest = async (payload: UserDataRequest) => {
  const response = await request<UserDataResponse>({
    method: 'POST',
    url: '/hosted/user/data/identity',
    data: {
      ...payload.data,
      speculative: !!payload.speculative,
    },
    headers: {
      [BIFROST_AUTH_HEADER]: payload.authToken,
    },
  });
  return response.data;
};

const useUserData = () =>
  useMutation<UserDataResponse, RequestError, UserDataRequest>(userDataRequest);

export default useUserData;
