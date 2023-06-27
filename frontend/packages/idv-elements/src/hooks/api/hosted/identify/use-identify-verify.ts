import request from '@onefootprint/request';
import {
  IdentifyVerifyRequest,
  IdentifyVerifyResponse,
  SANDBOX_ID_HEADER,
} from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

const identifyVerifyRequest = async (payload: IdentifyVerifyRequest) => {
  const { obConfigAuth, challengeResponse, challengeToken, sandboxId } =
    payload;
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
    },
    headers,
  });

  return response.data;
};

const useIdentifyVerify = () => useMutation(identifyVerifyRequest);

export default useIdentifyVerify;
