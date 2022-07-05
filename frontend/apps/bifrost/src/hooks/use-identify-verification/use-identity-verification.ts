import { useMutation } from 'react-query';
import request, { RequestError, RequestResponse } from 'request';
import { ChallengeKind, UserKind } from 'src/utils/state-machine/types';

export type IdentifyVerificationRequest = {
  challengeKind: ChallengeKind;
  challengeResponse: string; // either biometric response or the 6 code digit sent via sms
  challengeToken: string; // Challenge token received after email-identification
};

export type IdentifyVerificationResponse = {
  kind: UserKind;
  authToken: string;
};

const identifyVerificationRequest = async (
  payload: IdentifyVerificationRequest,
) => {
  const { data: response } = await request<
    RequestResponse<IdentifyVerificationResponse>
  >({
    method: 'POST',
    url: '/identify/verify',
    data: payload,
  });
  return response.data;
};

const useIdentifyVerification = () =>
  useMutation<
    IdentifyVerificationResponse,
    RequestError,
    IdentifyVerificationRequest
  >(identifyVerificationRequest);

export default useIdentifyVerification;
