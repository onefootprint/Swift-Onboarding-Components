import request from '@onefootprint/request';
import type { GetD2PResponse } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';

import { AUTH_HEADER } from '@/config/constants';

const getHandoffMeta = async (authToken: string) => {
  const response = await request<GetD2PResponse>({
    method: 'GET',
    url: '/hosted/onboarding/d2p/status',
    headers: {
      [AUTH_HEADER]: authToken,
    },
  });
  return response.data.meta;
};

const useHandoffMeta = (authToken: string = '') => {
  return useQuery(['appearance', authToken], () => getHandoffMeta(authToken), {
    enabled: !!authToken,
    onError: e => {
      console.log('error');
      console.log(e.message);
    },
  });
};

export default useHandoffMeta;
