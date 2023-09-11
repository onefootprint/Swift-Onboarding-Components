import request from '@onefootprint/request';
import type {
  SkipLivenessRequest,
  SkipLivenessResponse,
} from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

import { AUTH_HEADER } from '../../../../config/constants';

const skipLiveness = async (payload: SkipLivenessRequest) => {
  const response = await request<SkipLivenessResponse>({
    method: 'POST',
    url: '/hosted/onboarding/skip_passkey_register',
    data: payload,
    headers: {
      [AUTH_HEADER]: payload.authToken,
    },
  });
  return response.data;
};

const useSkipLiveness = () => useMutation(skipLiveness);

export default useSkipLiveness;
