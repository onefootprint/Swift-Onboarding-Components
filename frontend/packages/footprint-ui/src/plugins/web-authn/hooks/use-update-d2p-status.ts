import {
  UpdateD2PStatusRequest,
  UpdateD2PStatusResponse,
} from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';
import request, { RequestError } from 'request';

import { BIFROST_AUTH_HEADER } from '../config/constants';

const updateD2PStatus = async (payload: UpdateD2PStatusRequest) => {
  const response = await request<{}>({
    method: 'POST',
    url: '/hosted/onboarding/d2p/status',
    data: payload,
    headers: {
      [BIFROST_AUTH_HEADER]: payload.authToken,
    },
  });
  return response.data;
};

const useUpdateD2PStatus = () =>
  useMutation<UpdateD2PStatusResponse, RequestError, UpdateD2PStatusRequest>(
    updateD2PStatus,
  );

export default useUpdateD2PStatus;
