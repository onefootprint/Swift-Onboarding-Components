import { AUTH_HEADER } from '../constants';
import request from '../utils/request';

export type IdentifyVerifyRequest = {
  challengeResponse: string; // either biometric response or the 6 code digit sent via sms
  challengeToken: string; // Challenge token received after email-identification
  authToken: string;
  scope: 'auth' | 'onboarding';
};

export type IdentifyVerifyResponse = {
  authToken: string;
};

const identifyVerify = async ({
  challengeResponse,
  challengeToken,
  authToken,
  scope,
}: IdentifyVerifyRequest) => {
  const response = await request<IdentifyVerifyResponse>({
    method: 'POST',
    url: '/hosted/identify/verify',
    headers: {
      [AUTH_HEADER]: authToken,
    },
    data: {
      challengeResponse,
      challengeToken,
      scope,
    },
  });

  return response;
};

export default identifyVerify;
