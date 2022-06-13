import { useQuery } from 'react-query';
import request, { RequestError, RequestResponse } from 'request';
import { BIFROST_D2P_SCOPED_AUTH_HEADER } from 'src/config/constants';
import { useLivenessRegisterMachine } from 'src/pages/liveness-register/components/machine-provider';
import { MachineContext } from 'src/utils/state-machine/liveness-register';

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
  const { data: response } = await request<RequestResponse<GetD2PResponse>>({
    method: 'GET',
    url: '/onboarding/d2p/status',
    headers: {
      [BIFROST_D2P_SCOPED_AUTH_HEADER]: payload.scopedAuthToken,
    },
  });
  return response.data;
};

const useGetD2PStatus = () => {
  const [state] = useLivenessRegisterMachine();
  const { scopedAuthToken } = state.context as MachineContext;
  return useQuery<GetD2PResponse | undefined, RequestError>(
    [scopedAuthToken],
    // If scopedAuthToken hasn't been set yet, return undefined
    () => (scopedAuthToken ? getD2PStatus({ scopedAuthToken }) : undefined),
    {
      refetchInterval: D2P_STATUS_FETCH_INTERVAL,
      enabled: !!scopedAuthToken,
    },
  );
};

export default useGetD2PStatus;
