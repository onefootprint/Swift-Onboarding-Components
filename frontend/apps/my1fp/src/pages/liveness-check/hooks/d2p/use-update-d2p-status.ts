import { useMutation } from '@tanstack/react-query';
import request, { RequestError, RequestResponse } from 'request';
import { MY1FP_AUTH_HEADER } from 'src/config/constants';

export enum D2PStatusUpdate {
  inProgress = 'in_progress',
  canceled = 'canceled',
  failed = 'failed',
  completed = 'completed',
}

export type UpdateD2PStatusRequest = {
  authToken: string; // scoped auth token
  status: D2PStatusUpdate;
};

const updateD2PStatus = async (payload: UpdateD2PStatusRequest) => {
  const { data: response } = await request<RequestResponse<{}>>({
    method: 'POST',
    url: '/internal/onboarding/d2p/status',
    data: payload,
    headers: {
      [MY1FP_AUTH_HEADER]: payload.authToken,
    },
  });
  return response.data;
};

const useUpdateD2PStatus = () =>
  useMutation<{}, RequestError, UpdateD2PStatusRequest>(updateD2PStatus);

export default useUpdateD2PStatus;
