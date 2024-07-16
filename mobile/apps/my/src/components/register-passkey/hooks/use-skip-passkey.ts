import request from '@onefootprint/request';
import type { SkipLivenessRequest, SkipLivenessResponse } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

import { AUTH_HEADER } from '@/config/constants';

const skipPasskey = async (payload: SkipLivenessRequest) => {
  const { authToken, ...data } = payload;
  const response = await request<SkipLivenessResponse>({
    method: 'POST',
    url: '/hosted/onboarding/skip_passkey_register',
    data,
    headers: {
      [AUTH_HEADER]: authToken,
    },
  });

  return response.data;
};

const useSkipPasskey = () => useMutation(skipPasskey);

export default useSkipPasskey;
