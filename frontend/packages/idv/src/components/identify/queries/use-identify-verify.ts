import request from '@onefootprint/request';
import type { IdentifyVerifyRequest, IdentifyVerifyResponse } from '@onefootprint/types';
import { AUTH_HEADER } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

type PayloadPartKey = 'scope';
type Payload = Omit<IdentifyVerifyRequest, 'identifier'> & {
  authToken?: string;
};

const requestFn = async (payload: Payload) => {
  const { challengeResponse, challengeToken, authToken, scope } = payload;
  const headers: Record<string, string> = { [AUTH_HEADER]: authToken };

  const response = await request<IdentifyVerifyResponse>({
    method: 'POST',
    url: '/hosted/identify/verify',
    data: {
      challengeResponse,
      challengeToken,
      scope,
    },
    headers,
  });

  return response.data;
};

const useIdentifyVerify = (basePayload: Pick<Payload, PayloadPartKey>) =>
  useMutation({
    mutationFn: (restOfPayload: Omit<Payload, PayloadPartKey>) => requestFn({ ...basePayload, ...restOfPayload }),
  });

export default useIdentifyVerify;
