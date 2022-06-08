import { useMutation } from 'react-query';
import request, { RequestError, RequestResponse } from 'request';

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
    url: '/onboarding/d2p/status',
    data: payload,
    headers: {
      'X-Fpuser-Authorization': payload.authToken,
    },
  });
  return response.data;
};

const useUpdateD2PStatus = () =>
  useMutation<{}, RequestError, UpdateD2PStatusRequest>(updateD2PStatus);

export default useUpdateD2PStatus;
