import { useMutation } from '@tanstack/react-query';
import request, { RequestError, RequestResponse } from 'request';
import { IdentifyType } from 'src/utils/state-machine/types';

import getRetryDisabledUntil from './get-retry-disabled-until';

export type IdentifyChallengeRequest = {
  phoneNumber: string;
  identifyType: IdentifyType;
};

export type IdentifyChallengeResponse = {
  challengeToken: string;
  retryDisabledUntil: Date;
};

type PrivateIdentifyChallengeResponse = {
  challengeToken: string;
  timeBeforeRetryS: number;
};

const identifyChallenge = async (payload: IdentifyChallengeRequest) => {
  const { data: response } = await request<
    RequestResponse<PrivateIdentifyChallengeResponse>
  >({
    method: 'POST',
    url: '/hosted/identify/challenge',
    data: payload,
  });
  const { challengeToken, timeBeforeRetryS } = response.data;

  return {
    challengeToken,
    retryDisabledUntil: getRetryDisabledUntil(timeBeforeRetryS),
  };
};

const useIdentifyChallenge = () =>
  useMutation<
    IdentifyChallengeResponse,
    RequestError,
    IdentifyChallengeRequest
  >(identifyChallenge);

export default useIdentifyChallenge;
