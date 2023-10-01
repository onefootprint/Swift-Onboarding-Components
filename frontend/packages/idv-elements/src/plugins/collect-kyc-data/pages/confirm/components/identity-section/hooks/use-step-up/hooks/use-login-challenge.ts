import request from '@onefootprint/request';
import type { ChallengeData } from '@onefootprint/types';
import { AUTH_HEADER, ChallengeKind } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

export type LoginChallengeRequest = {
  authToken: string;
};

export type LoginChallengeResponse = {
  challengeData: ChallengeData;
};

const loginChallenge = async (payload: LoginChallengeRequest) => {
  const { authToken } = payload;
  const response = await request<LoginChallengeResponse>({
    method: 'POST',
    url: '/hosted/identify/login_challenge',
    data: {
      preferredChallengeKind: ChallengeKind.biometric,
    },
    headers: {
      [AUTH_HEADER]: authToken,
    },
  });
  const { challengeData } = { ...response.data };

  return {
    challengeData,
  };
};

const useLoginChallenge = () => useMutation(loginChallenge);

export default useLoginChallenge;
