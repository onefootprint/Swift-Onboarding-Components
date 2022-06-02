import { useMutation } from 'react-query';
import request, { RequestError, RequestResponse } from 'request';
import { ChallengeKind } from 'src/bifrost-machine/types';

export type IdentifyRequest = {
  identifier: {
    email?: string;
    phoneNumber?: string;
  };
  preferredChallengeKind: ChallengeKind;
};

export type ChallengeData = {
  challengeKind: ChallengeKind;
  challengeToken: string;
  phoneNumberLastTwo: string;
  biometricChallengeJson?: string;
};

export type IdentifyResponse = {
  userFound: boolean;
  challengeData?: ChallengeData;
};

const identifyRequest = async (payload: IdentifyRequest) => {
  const { data: response } = await request<RequestResponse<IdentifyResponse>>({
    method: 'POST',
    url: '/identify',
    data: payload,
  });
  return response.data;
};

const useIdentify = () =>
  useMutation<IdentifyResponse, RequestError, IdentifyRequest>(identifyRequest);

export default useIdentify;
