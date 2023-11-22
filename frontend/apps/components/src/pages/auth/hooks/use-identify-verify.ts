import request from '@onefootprint/request';
import type {
  IdentifyVerifyRequest,
  IdentifyVerifyResponse,
} from '@onefootprint/types';
import { SANDBOX_ID_HEADER } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

type Payload = Omit<IdentifyVerifyRequest, 'identifier' | 'scope'> & {
  scope?: 'auth';
};

const identifyVerifyRequest = async (payload: Payload) => {
  const {
    challengeResponse,
    challengeToken,
    obConfigAuth,
    sandboxId,
    scope = 'auth',
  } = payload;
  const headers: Record<string, string> = { ...obConfigAuth };
  if (sandboxId) {
    headers[SANDBOX_ID_HEADER] = sandboxId;
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

const useIdentifyVerify = () => useMutation(identifyVerifyRequest);

export default useIdentifyVerify;
