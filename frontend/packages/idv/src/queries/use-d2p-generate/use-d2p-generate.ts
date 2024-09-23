import request from '@onefootprint/request';
import type { D2PGenerateRequest, D2PGenerateResponse } from '@onefootprint/types';
import { AUTH_HEADER } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

const d2pGenerate = async (payload: D2PGenerateRequest) => {
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

  return response.data;
};

const useD2PGenerate = () => {
  return useMutation({
    mutationFn: d2pGenerate,
  });
};

export default useD2PGenerate;
