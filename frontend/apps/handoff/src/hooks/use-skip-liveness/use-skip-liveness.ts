import request, { RequestError } from '@onefootprint/request';
import { SkipLivenessRequest, SkipLivenessResponse } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

import {
  CLIENT_PUBLIC_KEY_HEADER,
  HANDOFF_AUTH_HEADER,
} from '../../config/constants';

const skipLiveness = async (payload: SkipLivenessRequest) => {
  const response = await request<{}>({
    method: 'POST',
    url: '/hosted/onboarding/skip_liveness',
    data: payload,
    headers: {
      [HANDOFF_AUTH_HEADER]: payload.authToken,
      [CLIENT_PUBLIC_KEY_HEADER]: payload.tenantPk,
    },
  });
  return response.data;
};

const useSkipLiveness = () =>
  useMutation<SkipLivenessResponse, RequestError, SkipLivenessRequest>(
    skipLiveness,
  );

export default useSkipLiveness;
