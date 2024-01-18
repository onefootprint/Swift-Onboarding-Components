import request from '@onefootprint/request';
import type {
  ObConfigAuth,
  SignupChallengeResponse,
} from '@onefootprint/types';
import { AUTH_HEADER, SANDBOX_ID_HEADER } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

import type { EmailAndOrPhone } from '../types';
import calculateRetryTime from './get-retry-time';

type PayloadPartKey = 'obConfigAuth' | 'sandboxId' | 'authToken';
type Payload = EmailAndOrPhone & {
  authToken?: string;
  obConfigAuth?: ObConfigAuth;
  sandboxId?: string;
};

const requestFn = async (payload: Payload) => {
  const { obConfigAuth, sandboxId, authToken, ...identifier } = payload;
  const headers: Record<string, string> = { ...obConfigAuth };
  if (sandboxId) {
    headers[SANDBOX_ID_HEADER] = sandboxId;
  }
  if (authToken) {
    headers[AUTH_HEADER] = authToken;
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
  challengeData.retryDisabledUntil = calculateRetryTime(
    challengeData.timeBeforeRetryS ?? 0,
  );

  return {
    challengeData,
    error,
  };
};

const useSignupChallenge = (basePayload: Pick<Payload, PayloadPartKey>) =>
  useMutation({
    mutationFn: (restOfPayload: Omit<Payload, PayloadPartKey>) =>
      requestFn({ ...basePayload, ...restOfPayload }),
  });

export default useSignupChallenge;
