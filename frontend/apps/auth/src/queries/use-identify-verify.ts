import request from '@onefootprint/request';
import type {
  IdentifyVerifyRequest,
  IdentifyVerifyResponse,
} from '@onefootprint/types';
import { AUTH_HEADER, SANDBOX_ID_HEADER } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

type PayloadPartKey = 'obConfigAuth' | 'sandboxId' | 'authToken';
type Payload = Omit<IdentifyVerifyRequest, 'identifier' | 'scope'> & {
  authToken?: string;
  scope?: 'auth';
};

const requestFn = async (payload: Payload) => {
  const {
    challengeResponse,
    challengeToken,
    authToken,
    obConfigAuth,
    sandboxId,
    scope = 'auth',
  } = payload;
  const headers: Record<string, string> = { ...obConfigAuth };
  if (sandboxId) {
    headers[SANDBOX_ID_HEADER] = sandboxId;
  }
  if (authToken) {
    headers[AUTH_HEADER] = authToken;
  }

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
    mutationFn: (restOfPayload: Omit<Payload, PayloadPartKey>) =>
      requestFn({ ...basePayload, ...restOfPayload }),
  });

export default useIdentifyVerify;
