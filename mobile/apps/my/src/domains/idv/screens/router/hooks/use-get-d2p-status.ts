import type { RequestError } from '@onefootprint/request';
import request from '@onefootprint/request';
import type { GetD2PResponse } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';

import { AUTH_HEADER } from '@/config/constants';

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

const getD2PStatus = async (scopedAuthToken: string) => {
  const { data: response } = await request<GetD2PResponse>({
    method: 'GET',
    url: '/hosted/onboarding/d2p/status',
    headers: {
      [AUTH_HEADER]: scopedAuthToken,
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
  useQuery(['d2p-status', authToken], () => getD2PStatus(authToken), {
    enabled: !!enabled && !!authToken,
    refetchInterval,
    onSuccess: options.onSuccess,
    onError: options.onError,
  });

export default useGetD2PStatus;
