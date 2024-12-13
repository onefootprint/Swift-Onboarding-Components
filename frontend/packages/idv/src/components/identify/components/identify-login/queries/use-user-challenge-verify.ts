import request from '@onefootprint/request';
import { AUTH_HEADER } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

type UserChallengeVerifyBody = {
  authToken: string;
  challengeResponse: string; // The response to the challenge. Either SMS/email PIN code or passkey response
  challengeToken: string; // The token given from initiating the challenge
};
type UserChallengeVerifyResponse = {};

const requestFn = async ({ authToken, challengeResponse, challengeToken }: UserChallengeVerifyBody) => {
  const headers: Record<string, string> = { [AUTH_HEADER]: authToken };

  const response = await request<UserChallengeVerifyResponse>({
    method: 'POST',
    url: '/hosted/user/challenge/verify',
    headers,
    data: { challengeResponse, challengeToken },
  });

  return response.data;
};

const useUserChallengeVerify = () =>
  useMutation({
    mutationFn: requestFn,
  });

export default useUserChallengeVerify;
