import type { GetD2PRequest, GetD2PResponse } from '@onefootprint/types';

import { AUTH_HEADER } from '../constants';
import request from '../utils/request';

const getD2PStatus = async ({ scopedAuthToken }: GetD2PRequest) => {
  const response = await request<GetD2PResponse>({
    method: 'GET',
    url: '/hosted/onboarding/d2p/status',
    headers: {
      [AUTH_HEADER]: scopedAuthToken,
    },
  });

  return response;
};

export default getD2PStatus;
