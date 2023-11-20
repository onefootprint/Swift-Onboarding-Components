import request from '@onefootprint/request';
import type { IdentifyRequest, IdentifyResponse } from '@onefootprint/types';
import { AUTH_HEADER, SANDBOX_ID_HEADER } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

const identifyRequest = async (payload: IdentifyRequest) => {
  const { obConfigAuth, identifier, sandboxId } = payload;
  const headers: Record<string, string> = { ...obConfigAuth };
  if (sandboxId) {
    headers[SANDBOX_ID_HEADER] = sandboxId;
  }
  const data: Partial<IdentifyRequest> = {};
  if ('authToken' in identifier) {
    headers[AUTH_HEADER] = identifier.authToken;
  } else {
    data.identifier = identifier;
  }
  const response = await request<IdentifyResponse>({
    method: 'POST',
    url: '/hosted/identify',
    data,
    headers,
  });
  const {
    userFound,
    availableChallengeKinds,
    hasSyncablePassKey,
    isUnverified,
  } = response.data;

  return {
    userFound,
    isUnverified,
    availableChallengeKinds,
    hasSyncablePassKey,
  };
};

const useIdentify = () => useMutation(identifyRequest);

export default useIdentify;
