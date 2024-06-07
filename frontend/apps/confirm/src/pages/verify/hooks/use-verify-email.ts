import request from '@onefootprint/request';
import type { UserEmailVerifyRequest, UserEmailVerifyResponse } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

const userDataRequest = async (payload: UserEmailVerifyRequest) => {
  const response = await request<UserEmailVerifyResponse>({
    method: 'POST',
    url: '/hosted/user/email/verify',
    data: payload,
  });
  return response.data;
};

const useVerifyEmail = () => useMutation(userDataRequest);

export default useVerifyEmail;
