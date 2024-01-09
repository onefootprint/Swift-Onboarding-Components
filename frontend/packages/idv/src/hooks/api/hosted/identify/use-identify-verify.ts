import request from '@onefootprint/request';
import type {
  IdentifyVerifyRequest,
  IdentifyVerifyResponse,
} from '@onefootprint/types';
import { AUTH_HEADER, SANDBOX_ID_HEADER } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

const identifyVerifyRequest = async (payload: IdentifyVerifyRequest) => {
  const {
    obConfigAuth,
    challengeResponse,
    challengeToken,
    sandboxId,
    identifier,
    scope = 'onboarding',
  } = payload;
  const headers: Record<string, string> = { ...obConfigAuth };
  if (sandboxId) {
    headers[SANDBOX_ID_HEADER] = sandboxId;
  }
  if ('authToken' in identifier) {
    headers[AUTH_HEADER] = identifier.authToken;
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
