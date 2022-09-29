import request, { RequestError } from '@onefootprint/request';
import {
  IdentifyChallengeRequest,
  IdentifyChallengeResponse,
} from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

import getRetryDisabledUntil from './get-retry-disabled-until';

const identifyChallenge = async (payload: IdentifyChallengeRequest) => {
  const response = await request<IdentifyChallengeResponse>({
    method: 'POST',
    url: '/hosted/identify/challenge',
    data: payload,
  });
  const { challengeToken, timeBeforeRetryS } = response.data;

  return {
    challengeToken,
    retryDisabledUntil: getRetryDisabledUntil(timeBeforeRetryS ?? 0),
  };
};

const useIdentifyChallenge = () =>
  useMutation<
    IdentifyChallengeResponse,
    RequestError,
    IdentifyChallengeRequest
  >(identifyChallenge);

export default useIdentifyChallenge;
