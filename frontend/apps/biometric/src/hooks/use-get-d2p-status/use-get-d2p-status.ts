import { useQuery } from '@tanstack/react-query';
import request, { RequestError, RequestResponse } from 'request';
import { BIOMETRIC_AUTH_HEADER } from 'src/config/constants';
import useD2PMobileMachine from 'src/hooks/use-d2p-mobile-machine';

const D2P_STATUS_FETCH_INTERVAL = 1000;

export type GetD2PRequest = {
  authToken: string;
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
  const { data: response } = await request<RequestResponse<GetD2PResponse>>({
    method: 'GET',
    url: '/onboarding/d2p/status',
    headers: {
      [BIOMETRIC_AUTH_HEADER]: payload.authToken,
    },
  });
  return response.data;
};

const useGetD2PStatus = () => {
  const [state] = useD2PMobileMachine();
  const { authToken } = state.context;
  return useQuery<GetD2PResponse, RequestError>(
    [authToken],
    () => getD2PStatus({ authToken }),
    {
      refetchInterval: D2P_STATUS_FETCH_INTERVAL,
    },
  );
};

export default useGetD2PStatus;
