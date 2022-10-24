import request, { RequestError } from '@onefootprint/request';
import { GetD2PRequest, GetD2PResponse } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import { Events } from 'src/utils/state-machine/types';

import { AUTH_HEADER } from '../../config/constants';
import useHandoffMachine from '../use-handoff-machine';

const D2P_STATUS_FETCH_INTERVAL = 1000;

const getD2PStatus = async (payload: GetD2PRequest) => {
  const response = await request<GetD2PResponse>({
    method: 'GET',
    url: '/hosted/onboarding/d2p/status',
    headers: {
      [AUTH_HEADER]: payload.scopedAuthToken,
    },
  });
  return response.data;
};

const useGetD2PStatus = () => {
  const [state, send] = useHandoffMachine();
  const { authToken } = state.context;

  const handleSuccess = (data: GetD2PResponse) => {
    send({
      type: Events.statusReceived,
      payload: {
        status: data.status,
      },
    });
  };

  const handleError = () => {
    send({
      type: Events.statusReceived,
      payload: {
        isError: true,
      },
    });
  };

  return useQuery<GetD2PResponse, RequestError>(
    [authToken],
    () => getD2PStatus({ scopedAuthToken: authToken ?? '' }),
    {
      enabled: !!authToken && !state.done,
      refetchInterval: D2P_STATUS_FETCH_INTERVAL,
      onSuccess: handleSuccess,
      onError: handleError,
    },
  );
};

export default useGetD2PStatus;
