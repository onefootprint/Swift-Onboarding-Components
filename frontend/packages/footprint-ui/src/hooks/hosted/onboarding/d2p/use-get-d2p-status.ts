import request, { RequestError } from '@onefootprint/request';
import { GetD2PRequest, GetD2PResponse } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';

import { AUTH_HEADER } from '../../../../config/constants';

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

const useGetD2PStatus = (
  enabled: boolean,
  authToken: string,
  options: {
    onSuccess?: (response: GetD2PResponse) => void;
    onError?: (error: RequestError) => void;
  } = {},
) =>
  useQuery(
    [authToken, enabled, 'get-d2p-status'],
    () => getD2PStatus({ scopedAuthToken: authToken ?? '' }),
    {
      enabled: !!authToken && !!enabled,
      refetchInterval: D2P_STATUS_FETCH_INTERVAL,
      onSuccess: options.onSuccess,
      onError: options.onError,
    },
  );

export default useGetD2PStatus;
