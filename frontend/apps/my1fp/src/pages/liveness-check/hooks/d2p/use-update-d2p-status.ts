import request from '@onefootprint/request';
import { UpdateD2PStatusRequest } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';
import { AUTH_HEADER } from 'src/config/constants';

const updateD2PStatus = async (payload: UpdateD2PStatusRequest) => {
  const response = await request<{}>({
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
