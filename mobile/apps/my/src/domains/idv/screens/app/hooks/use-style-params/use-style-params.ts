import request from '@onefootprint/request';
import { GetD2PResponse } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';

import { AUTH_HEADER } from '@/config/constants';

const getD2PStatus = async (authToken: string) => {
  const response = await request<GetD2PResponse>({
    method: 'GET',
    url: '/hosted/onboarding/d2p/status',
    headers: {
      [AUTH_HEADER]: authToken,
    },
  });
  return response.data.meta.styleParams;
};

const useStyleParams = (authToken: string = '') => {
  return useQuery(['appearance', authToken], () => getD2PStatus(authToken), {
    enabled: !!authToken,
  });
};

export default useStyleParams;
