import request from '@onefootprint/request';
import type { UpdateD2PStatusRequest, UpdateD2PStatusResponse } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

import { AUTH_HEADER } from '@/config/constants';

const updateD2PStatus = async ({ authToken, ...data }: UpdateD2PStatusRequest) => {
  const response = await request<UpdateD2PStatusResponse>({
    method: 'POST',
    url: '/hosted/onboarding/d2p/status',
    data,
    headers: {
      [AUTH_HEADER]: authToken,
    },
  });

  return response.data;
};

const useUpdateD2PStatus = () => useMutation(updateD2PStatus);

export default useUpdateD2PStatus;
