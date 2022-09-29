import request, { RequestError } from '@onefootprint/request';
import {
  UserEmailVerifyRequest,
  UserEmailVerifyResponse,
} from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

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
