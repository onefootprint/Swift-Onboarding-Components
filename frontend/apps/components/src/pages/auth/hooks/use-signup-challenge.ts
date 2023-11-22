import request from '@onefootprint/request';
import type {
  ObConfigAuth,
  SignupChallengeResponse,
} from '@onefootprint/types';
import { SANDBOX_ID_HEADER } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

import type { EmailAndOrPhone } from '../types';
import getRetryDisabledUntil from './get-retry-disabled-until';

type Payload = EmailAndOrPhone & {
  obConfigAuth: ObConfigAuth;
  sandboxId?: string;
};

const signupChallenge = async (payload: Payload) => {
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
  const { challengeData, error } = { ...response.data };
  challengeData.retryDisabledUntil = getRetryDisabledUntil(
    challengeData.timeBeforeRetryS ?? 0,
  );

  return {
    challengeData,
    error,
  };
};

const useSignupChallenge = () => useMutation(signupChallenge);

export default useSignupChallenge;
