import { useMutation } from 'react-query';
import request, { RequestError, RequestResponse } from 'request';

export type UserDataRequest = {
  data: {
    firstName?: string;
    lastName?: string;
    dob?: string;
    email?: string;
    ssn?: string;
    streetAddress?: string;
    streetAddress2?: string;
    city?: string;
    state?: string;
    country?: string;
    zip?: string;
  };
  authToken: string;
};

export type UserDataResponse = { data: string };

const userDataRequest = async (payload: UserDataRequest) => {
  const { data: response } = await request<RequestResponse<UserDataResponse>>({
    method: 'POST',
    url: '/user/data',
    data: payload.data,
    headers: {
      'X-Fpuser-Authorization': payload.authToken,
    },
  });
  return response.data;
};

const useUserData = () =>
  useMutation<UserDataResponse, RequestError, UserDataRequest>(userDataRequest);

export default useUserData;
