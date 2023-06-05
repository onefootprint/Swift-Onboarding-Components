import request from '@onefootprint/request';
import { useMutation } from '@tanstack/react-query';

import { AUTH_HEADER } from '../../../../../../../../../config/constants';

export type IdentifyVerifyRequest = {
  challengeResponse: string; // either biometric response or the 6 code digit sent via sms
  challengeToken: string; // Challenge token received after email-identification
  authToken: string;
};

export type IdentifyVerifyResponse = {
  authToken: string;
};

const identifyVerifyRequest = async (payload: IdentifyVerifyRequest) => {
  const { challengeResponse, challengeToken, authToken } = payload;
  const response = await request<IdentifyVerifyResponse>({
    method: 'POST',
    url: '/hosted/identify/verify',
    data: {
      challengeResponse,
      challengeToken,
    },
    headers: {
      [AUTH_HEADER]: authToken,
    },
  });

  return response.data;
};

const useIdentifyVerify = () => useMutation(identifyVerifyRequest);

export default useIdentifyVerify;
