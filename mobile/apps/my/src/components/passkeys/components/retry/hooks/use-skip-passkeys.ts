import request from '@onefootprint/request';
import { SkipPasskeysRequest, SkipPasskeysResponse } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

import { AUTH_HEADER } from '@/config/constants';

const skipPasskeys = async (payload: SkipPasskeysRequest) => {
  const response = await request<SkipPasskeysResponse>({
    method: 'POST',
    url: '/hosted/onboarding/skip_passkey_register',
    data: payload,
    headers: {
      [AUTH_HEADER]: payload.authToken,
    },
  });

  return response.data;
};

const useSkipPasskeys = () => useMutation(skipPasskeys);

export default useSkipPasskeys;
