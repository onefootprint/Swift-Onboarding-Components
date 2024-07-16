import request from '@onefootprint/request';
import type { SignupChallengeRequest, SignupChallengeResponse } from '@onefootprint/types';
import { SANDBOX_ID_HEADER } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

import getRetryDisabledUntil from '@/utils/get-retry-disabled-until';

const signupChallenge = async (payload: SignupChallengeRequest) => {
  const { obConfigAuth, sandboxId, email, phoneNumber } = payload;
  const headers: Record<string, string> = { ...obConfigAuth };
  if (sandboxId) {
    headers[SANDBOX_ID_HEADER] = sandboxId;
  }
  const response = await request<SignupChallengeResponse>({
    method: 'POST',
    url: '/hosted/identify/signup_challenge',
    data: {
      email: {
        value: email,
        isBootstrap: false, // TODO
      },
      phoneNumber: {
        value: phoneNumber,
        isBootstrap: false, // TODO
      },
    },
    headers,
  });
  const { challengeData, error } = { ...response.data };
  challengeData.retryDisabledUntil = getRetryDisabledUntil(challengeData.timeBeforeRetryS ?? 0);

  return {
    challengeData,
    error,
  };
};

const useSignupChallenge = () => useMutation(signupChallenge);

export default useSignupChallenge;
