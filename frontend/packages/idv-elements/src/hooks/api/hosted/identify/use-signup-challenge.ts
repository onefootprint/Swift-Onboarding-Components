import request from '@onefootprint/request';
import {
  SANDBOX_ID_HEADER,
  SignupChallengeRequest,
  SignupChallengeResponse,
} from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

import getRetryDisabledUntil from './utils/get-retry-disabled-until';

const signupChallenge = async (payload: SignupChallengeRequest) => {
  const { obConfigAuth, sandboxId, ...identifier } = payload;
  const headers: Record<string, string> = { ...obConfigAuth };
  if (sandboxId) {
    headers[SANDBOX_ID_HEADER] = sandboxId;
  }
  const response = await request<SignupChallengeResponse>({
    method: 'POST',
    url: '/hosted/identify/signup_challenge',
    data: {
      ...identifier,
    },
    headers,
  });
  const { challengeData } = { ...response.data };
  challengeData.retryDisabledUntil = getRetryDisabledUntil(
    challengeData.timeBeforeRetryS ?? 0,
  );

  return {
    challengeData,
  };
};

const useSignupChallenge = () => useMutation(signupChallenge);

export default useSignupChallenge;
