import { useMutation } from '@tanstack/react-query';
import request, { RequestError, RequestResponse } from 'request';
import { BIFROST_AUTH_HEADER } from 'src/config/constants';

export type UserDataObj = {
  address?: {
    address?: {
      streetAddress?: string;
      streetAddress2?: string;
    };
    city?: string;
    state?: string;
    country?: string;
    zip?: string;
  };
  dob?: {
    day?: number;
    month?: number;
    year?: number;
  };
  email?: string;
  name?: {
    firstName?: string;
    lastName?: string;
  };
  ssn?: string;
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
    url: '/user/data',
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
