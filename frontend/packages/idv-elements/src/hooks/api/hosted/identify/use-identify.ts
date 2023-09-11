import request from '@onefootprint/request';
import type { IdentifyRequest, IdentifyResponse } from '@onefootprint/types';
import { SANDBOX_ID_HEADER } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

const identifyRequest = async (payload: IdentifyRequest) => {
  const { obConfigAuth, identifier, sandboxId } = payload;
  const headers: Record<string, string> = { ...obConfigAuth };
  if (sandboxId) {
    headers[SANDBOX_ID_HEADER] = sandboxId;
  }
  const response = await request<IdentifyResponse>({
    method: 'POST',
    url: '/hosted/identify',
    data: {
      identifier,
    },
    headers,
  });
  const { userFound, availableChallengeKinds, hasSyncablePassKey } =
    response.data;

  return {
    userFound,
    availableChallengeKinds,
    hasSyncablePassKey,
  };
};

const useIdentify = () => useMutation(identifyRequest);

export default useIdentify;
