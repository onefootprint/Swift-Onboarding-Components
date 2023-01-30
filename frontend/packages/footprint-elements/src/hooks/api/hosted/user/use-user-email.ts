import request from '@onefootprint/request';
import { UserEmailRequest, UserEmailResponse } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

import { AUTH_HEADER } from '../../../../config/constants';

const userEmailRequest = async (payload: UserEmailRequest) => {
  const response = await request<UserEmailResponse>({
    method: 'POST',
    url: '/hosted/user/email',
    data: {
      ...payload.data,
      speculative: !!payload.speculative,
    },
    headers: {
      [AUTH_HEADER]: payload.authToken,
    },
  });
  return response.data;
};

const useUserEmail = () => useMutation(userEmailRequest);

export default useUserEmail;
