import type {
  D2PGenerateRequest,
  D2PGenerateResponse,
} from '@onefootprint/types';

import { AUTH_HEADER } from '../constants';
import request from '../utils/request';

const createD2pToken = async (payload: D2PGenerateRequest) => {
  const { authToken, meta } = payload;
  const response = await request<D2PGenerateResponse>({
    method: 'POST',
    url: '/hosted/onboarding/d2p/generate',
    data: {
      meta,
    },
    headers: {
      [AUTH_HEADER]: authToken,
    },
  });

  return response;
};

export default createD2pToken;
