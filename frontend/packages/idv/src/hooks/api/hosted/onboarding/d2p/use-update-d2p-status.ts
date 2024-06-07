import request from '@onefootprint/request';
import type { UpdateD2PStatusRequest, UpdateD2PStatusResponse } from '@onefootprint/types';
import { AUTH_HEADER } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

const updateD2PStatus = async (payload: UpdateD2PStatusRequest) => {
  const response = await request<UpdateD2PStatusResponse>({
    method: 'POST',
    url: '/hosted/onboarding/d2p/status',
    data: payload,
    headers: {
      [AUTH_HEADER]: payload.authToken,
    },
  });
  return response.data;
};

const useUpdateD2PStatus = () => useMutation(updateD2PStatus);

export default useUpdateD2PStatus;
