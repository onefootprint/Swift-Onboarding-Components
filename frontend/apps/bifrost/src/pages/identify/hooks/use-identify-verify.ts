import { useMutation } from '@tanstack/react-query';
import request, { RequestError } from 'request';
import { IdentifyUserKind } from 'types';

export type IdentifyVerifyRequest = {
  challengeResponse: string; // either biometric response or the 6 code digit sent via sms
  challengeToken: string; // Challenge token received after email-identification
};

export type IdentifyVerifyResponse = {
  kind: IdentifyUserKind;
  authToken: string;
};

const identifyVerifyRequest = async (payload: IdentifyVerifyRequest) => {
  const response = await request<IdentifyVerifyResponse>({
    method: 'POST',
    url: '/hosted/identify/verify',
    data: payload,
  });
  return response.data;
};

const useIdentifyVerify = () =>
  useMutation<IdentifyVerifyResponse, RequestError, IdentifyVerifyRequest>(
    identifyVerifyRequest,
  );

export default useIdentifyVerify;
