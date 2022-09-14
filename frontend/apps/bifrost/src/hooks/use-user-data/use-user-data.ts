import { useMutation } from '@tanstack/react-query';
import request, { RequestError } from 'request';
import { BIFROST_AUTH_HEADER } from 'src/config/constants';
import { UserDataRequest, UserDataResponse } from 'types';

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
