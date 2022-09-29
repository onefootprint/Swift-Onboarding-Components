import request, { RequestError } from '@onefootprint/request';
import { UserEmailRequest, UserEmailResponse } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';
import { BIFROST_AUTH_HEADER } from 'src/config/constants';

const userEmailRequest = async (payload: UserEmailRequest) => {
  const response = await request<UserEmailResponse>({
    method: 'POST',
    url: '/hosted/user/email',
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

const useUserEmail = () =>
  useMutation<UserEmailResponse, RequestError, UserEmailRequest>(
    userEmailRequest,
  );

export default useUserEmail;
