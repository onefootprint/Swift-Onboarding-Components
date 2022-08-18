import { useMutation } from '@tanstack/react-query';
import request, { RequestError, RequestResponse } from 'request';
import { BIFROST_AUTH_HEADER } from 'src/config/constants';

export type UserDataObj = {
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    country?: string;
    zip?: string;
  };
  zip_address?: {
    country?: string;
    zip?: string;
  };
  dob?: {
    day?: number;
    month?: number;
    year?: number;
  };
  name?: {
    firstName?: string;
    lastName?: string;
  };
  ssn9?: string;
  ssn4?: string;
};

export type UserDataRequest = {
  data: UserDataObj;
  authToken: string;
  speculative?: boolean;
};

export type UserDataResponse = { data: string };

const userDataRequest = async (payload: UserDataRequest) => {
  const { data: response } = await request<RequestResponse<UserDataResponse>>({
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
