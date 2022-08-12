import { useMutation } from '@tanstack/react-query';
import request, { RequestError, RequestResponse } from 'request';

export type UserDataRequest = {
  data: string;
};

export type UserDataResponse = RequestResponse<string>;

const userDataRequest = async (payload: UserDataRequest) => {
  const { data: response } = await request<RequestResponse<UserDataResponse>>({
    method: 'POST',
    url: '/hosted/user/email/verify',
    data: payload,
  });
  return response.data;
};

const useVerifyEmail = () =>
  useMutation<UserDataResponse, RequestError, UserDataRequest>(userDataRequest);

export default useVerifyEmail;
