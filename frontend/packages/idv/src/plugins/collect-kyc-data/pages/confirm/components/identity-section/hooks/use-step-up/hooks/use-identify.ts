import request from '@onefootprint/request';
import type { IdentifyResponse } from '@onefootprint/types';
import { AUTH_HEADER } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

export type IdentifyRequest = {
  authToken: string;
};

const identifyRequest = async (payload: IdentifyRequest) => {
  const { authToken } = payload;
  const response = await request<IdentifyResponse>({
    method: 'POST',
    url: '/hosted/identify',
    data: {},
    headers: {
      [AUTH_HEADER]: authToken,
    },
  });
  return response.data;
};

const useIdentify = () => useMutation(identifyRequest);

export default useIdentify;
