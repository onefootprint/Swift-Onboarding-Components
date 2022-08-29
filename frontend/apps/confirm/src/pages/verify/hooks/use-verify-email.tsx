import { useMutation } from '@tanstack/react-query';
import request, { RequestError } from 'request';

export type UserDataRequest = {
  data: string;
};

export type UserDataResponse = {};

const userDataRequest = async (payload: UserDataRequest) => {
  const response = await request<UserDataResponse>({
    method: 'POST',
    url: '/hosted/user/email/verify',
    data: payload,
  });
  return response.data;
};

const useVerifyEmail = () =>
  useMutation<UserDataResponse, RequestError, UserDataRequest>(userDataRequest);

export default useVerifyEmail;
