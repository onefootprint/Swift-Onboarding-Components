import request, { RequestError } from '@onefootprint/request';
import { IdentifyRequest, IdentifyResponse } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

import getRetryDisabledUntil from './utils/get-retry-disabled-until';

const identifyRequest = async (payload: IdentifyRequest) => {
  const response = await request<IdentifyResponse>({
    method: 'POST',
    url: '/hosted/identify',
    data: payload,
  });
  const { userFound, challengeData, availableChallengeKinds } = response.data;

  return {
    userFound,
    availableChallengeKinds,
    challengeData: challengeData
      ? {
          ...challengeData,
          retryDisabledUntil: getRetryDisabledUntil(
            challengeData.timeBeforeRetryS ?? 0,
          ),
        }
      : undefined,
  };
};
const useIdentify = () =>
  useMutation<IdentifyResponse, RequestError, IdentifyRequest>(identifyRequest);

export default useIdentify;
