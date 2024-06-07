import type { RequestError } from '@onefootprint/request';
import request from '@onefootprint/request';
import type { GetD2PRequest, GetD2PResponse } from '@onefootprint/types';
import { AUTH_HEADER } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';

type GetD2PStatusPollArgs = {
  enabled?: boolean;
  refetchInterval?: number | false;
  authToken: string;
  options?: {
    onSuccess?: (response: GetD2PResponse) => void;
    onError?: (error: RequestError) => void;
  };
};

const D2P_STATUS_FETCH_INTERVAL = 1000;

const getD2PStatus = async (payload: GetD2PRequest) => {
  const { data: response } = await request<GetD2PResponse>({
    method: 'GET',
    url: '/hosted/onboarding/d2p/status',
    headers: {
      [AUTH_HEADER]: payload.scopedAuthToken,
    },
  });

  return response;
};

const useGetD2PStatus = ({
  authToken,
  enabled = true,
  refetchInterval = D2P_STATUS_FETCH_INTERVAL,
  options = {},
}: GetD2PStatusPollArgs) =>
  useQuery([authToken, enabled, 'get-d2p-status'], () => getD2PStatus({ scopedAuthToken: authToken ?? '' }), {
    enabled: !!authToken && !!enabled,
    refetchInterval,
    onSuccess: options.onSuccess,
    onError: options.onError,
  });

export default useGetD2PStatus;
