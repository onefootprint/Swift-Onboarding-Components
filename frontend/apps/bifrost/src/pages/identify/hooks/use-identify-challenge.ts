import { useMutation } from '@tanstack/react-query';
import request, { RequestError, RequestResponse } from 'request';
import { IdentifyType } from 'src/utils/state-machine/types';

export type IdentifyChallengeRequest = {
  phoneNumber: string;
  identifyType: IdentifyType;
};

export type IdentifyChallengeResponse = {
  challengeToken: string;
  timeBeforeRetryS: number;
};

const identifyChallenge = async (payload: IdentifyChallengeRequest) => {
  const { data: response } = await request<
    RequestResponse<IdentifyChallengeResponse>
  >({
    method: 'POST',
    url: '/internal/identify/challenge',
    data: payload,
  });
  return response.data;
};

const useIdentifyChallenge = () =>
  useMutation<
    IdentifyChallengeResponse,
    RequestError,
    IdentifyChallengeRequest
  >(identifyChallenge);

export default useIdentifyChallenge;
