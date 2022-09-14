import { useMutation } from '@tanstack/react-query';
import request, { RequestError } from 'request';
import { UserEmailVerifyRequest, UserEmailVerifyResponse } from 'types';

const userDataRequest = async (payload: UserEmailVerifyRequest) => {
  const response = await request<UserEmailVerifyResponse>({
    method: 'POST',
    url: '/hosted/user/email/verify',
    data: payload,
  });
  return response.data;
};

const useVerifyEmail = () =>
  useMutation<UserEmailVerifyResponse, RequestError, UserEmailVerifyRequest>(
    userDataRequest,
  );

export default useVerifyEmail;
