import request, { RequestError } from '@onefootprint/request';
import { useQuery } from '@tanstack/react-query';

import { useD2PMachine } from '../components/machine-provider';
import BIFROST_AUTH_HEADER from '../config/constants';

const D2P_STATUS_FETCH_INTERVAL = 1000;

export type GetD2PRequest = {
  scopedAuthToken: string;
};

export enum D2PStatus {
  waiting = 'waiting',
  inProgress = 'in_progress',
  canceled = 'canceled',
  failed = 'failed',
  completed = 'completed',
}

export type GetD2PResponse = {
  status: D2PStatus;
};

const getD2PStatus = async (payload: GetD2PRequest) => {
  const response = await request<GetD2PResponse>({
    method: 'GET',
    url: '/hosted/onboarding/d2p/status',
    headers: {
      [BIFROST_AUTH_HEADER]: payload.scopedAuthToken,
    },
  });
  return response.data;
};

const useGetD2PStatus = (
  options: {
    onSuccess?: (data: GetD2PResponse) => void;
    onError?: (error: RequestError) => void;
  } = {},
) => {
  const [state] = useD2PMachine();
  const scopedAuthToken = state.context.scopedAuthToken || '';

  return useQuery<GetD2PResponse, RequestError>(
    ['d2p-status', scopedAuthToken],
    () => getD2PStatus({ scopedAuthToken }),
    {
      refetchInterval: D2P_STATUS_FETCH_INTERVAL,
      enabled: !!scopedAuthToken,
      onSuccess: options.onSuccess,
      onError: options.onError,
    },
  );
};

export default useGetD2PStatus;
