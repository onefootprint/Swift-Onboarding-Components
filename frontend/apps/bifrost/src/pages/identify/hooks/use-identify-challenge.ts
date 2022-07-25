import { useMutation } from 'react-query';
import request, { RequestError, RequestResponse } from 'request';

export type IdentifyChallengeRequest = {
  phoneNumber: string;
};

export type IdentifyChallengeResponse = {
  challengeToken: string;
};

const identifyChallenge = async (payload: IdentifyChallengeRequest) => {
  const { data: response } = await request<
    RequestResponse<IdentifyChallengeResponse>
  >({
    method: 'POST',
    url: '/identify/challenge',
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
