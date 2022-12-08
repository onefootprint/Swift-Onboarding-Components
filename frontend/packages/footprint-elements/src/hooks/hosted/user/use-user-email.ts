import request from '@onefootprint/request';
import { UserEmailRequest, UserEmailResponse } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

import {
  AUTH_HEADER,
  ONBOARDING_CONFIG_KEY_HEADER,
} from '../../../config/constants';

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
      // Temporarily including the ob public key header here in order to associate addedd email with
      // a tenant user
      [ONBOARDING_CONFIG_KEY_HEADER]: payload.tenantPk,
    },
  });
  return response.data;
};

const useUserEmail = () => useMutation(userEmailRequest);

export default useUserEmail;
