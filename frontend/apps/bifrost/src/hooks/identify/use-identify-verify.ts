import { useMutation } from 'react-query';
import request, { RequestError, RequestResponse } from 'request';
import { ChallengeKind } from 'src/bifrost-machine/types';

export type IdentifyVerifyRequest = {
  challengeKind: ChallengeKind;
  challengeResponse: string; // either biometric response or the 6 code digit sent via sms
  challengeToken: string; // Challenge token received after email-identification
};

export type IdentifyVerifyResponse = {
  authToken: string;
};

const identifyVerifyRequest = async (payload: IdentifyVerifyRequest) => {
  const { data: response } = await request<
    RequestResponse<IdentifyVerifyResponse>
  >({
    method: 'POST',
    url: '/identify/verify',
    data: payload,
  });
  return response.data;
};

const useIdentifyVerify = () =>
  useMutation<IdentifyVerifyResponse, RequestError, IdentifyVerifyRequest>(
    identifyVerifyRequest,
  );

export default useIdentifyVerify;
