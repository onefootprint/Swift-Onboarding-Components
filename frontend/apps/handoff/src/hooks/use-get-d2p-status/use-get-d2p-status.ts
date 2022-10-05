import request, { RequestError } from '@onefootprint/request';
import { useQuery } from '@tanstack/react-query';
import { HANDOFF_AUTH_HEADER } from 'src/config/constants';
import useHandoffMachine from 'src/hooks/use-handoff-machine';

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
  const response = await request<GetD2PResponse>({
    method: 'GET',
    url: '/hosted/onboarding/d2p/status',
    headers: {
      [HANDOFF_AUTH_HEADER]: payload.authToken,
    },
  });
  return response.data;
};

const useGetD2PStatus = () => {
  const [state] = useHandoffMachine();
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
