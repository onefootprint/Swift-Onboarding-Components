import request from '@onefootprint/request';
import { IdentifyRequest, IdentifyResponse } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

const identifyRequest = async (payload: IdentifyRequest) => {
  const { obConfigAuth, identifier } = payload;
  const response = await request<IdentifyResponse>({
    method: 'POST',
    url: '/hosted/identify',
    data: {
      identifier,
    },
    headers: obConfigAuth,
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
