import { useMutation } from '@tanstack/react-query';
import request, { RequestError } from 'request';
import { BIFROST_AUTH_HEADER } from 'src/config/constants';

export type UserEmailObj = {
  email?: string;
};

export type UserEmailRequest = {
  data: UserEmailObj;
  authToken: string;
  speculative?: boolean;
};

export type UserEmailResponse = {};

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
