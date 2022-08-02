import { useMutation } from '@tanstack/react-query';
import request, { RequestError, RequestResponse } from 'request';
import { UserKind } from 'src/utils/state-machine/types';

export type IdentifyVerifyRequest = {
  challengeResponse: string; // either biometric response or the 6 code digit sent via sms
  challengeToken: string; // Challenge token received after email-identification
};

export type IdentifyVerifyResponse = {
  kind: UserKind;
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
