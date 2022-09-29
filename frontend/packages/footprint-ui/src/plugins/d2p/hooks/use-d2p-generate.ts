import request, { RequestError } from '@onefootprint/request';
import { D2PGenerateRequest, D2PGenerateResponse } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

import BIFROST_AUTH_HEADER from '../config/constants';

const d2pGenerate = async (payload: D2PGenerateRequest) => {
  const response = await request<D2PGenerateResponse>({
    method: 'POST',
    url: '/hosted/onboarding/d2p/generate',
    data: payload,
    headers: {
      [BIFROST_AUTH_HEADER]: payload.authToken,
    },
  });
  return response.data;
};

const useD2PGenerate = () =>
  useMutation<D2PGenerateResponse, RequestError, D2PGenerateRequest>(
    d2pGenerate,
  );

export default useD2PGenerate;
