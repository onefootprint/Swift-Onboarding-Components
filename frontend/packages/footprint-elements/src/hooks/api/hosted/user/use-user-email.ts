import request from '@onefootprint/request';
import { UserEmailRequest, UserEmailResponse } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

import { AUTH_HEADER } from '../../../../config/constants';

const userEmailRequest = async (payload: UserEmailRequest) => {
  const response = await request<UserEmailResponse>({
    method: 'POST',
    url: '/hosted/user/email',
    data: {
      email: payload.data.email,
      speculative: false,
    },
    headers: {
      [AUTH_HEADER]: payload.authToken,
    },
  });
  return response.data;
};

const useUserEmail = () => useMutation(userEmailRequest);

export default useUserEmail;
