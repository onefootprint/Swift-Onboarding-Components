import { useMutation } from '@tanstack/react-query';
import request, { RequestError } from 'request';
import { MY1FP_AUTH_HEADER } from 'src/config/constants';
import { UpdateD2PStatusRequest, UpdateD2PStatusResponse } from 'types';

const updateD2PStatus = async (payload: UpdateD2PStatusRequest) => {
  const response = await request<{}>({
    method: 'POST',
    url: '/hosted/onboarding/d2p/status',
    data: payload,
    headers: {
      [MY1FP_AUTH_HEADER]: payload.authToken,
    },
  });
  return response.data;
};

const useUpdateD2PStatus = () =>
  useMutation<UpdateD2PStatusResponse, RequestError, UpdateD2PStatusRequest>(
    updateD2PStatus,
  );

export default useUpdateD2PStatus;
