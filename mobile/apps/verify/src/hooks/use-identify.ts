import request from '@onefootprint/request';
import type { IdentifyRequest, IdentifyResponse } from '@onefootprint/types';
import { AUTH_HEADER, SANDBOX_ID_HEADER } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

const identifyRequest = async (payload: IdentifyRequest) => {
  const { obConfigAuth, email, phoneNumber, authToken, sandboxId } = payload;
  const headers: Record<string, string> = { ...obConfigAuth };
  if (sandboxId) {
    headers[SANDBOX_ID_HEADER] = sandboxId;
  }
  const data: Record<string, unknown> = { email, phoneNumber };
  if (authToken) {
    headers[AUTH_HEADER] = authToken;
  }

  const response = await request<IdentifyResponse>({
    method: 'POST',
    url: '/hosted/identify',
    data,
    headers,
  });
  return response.data;
};

const useIdentify = () => useMutation(identifyRequest);

export default useIdentify;
