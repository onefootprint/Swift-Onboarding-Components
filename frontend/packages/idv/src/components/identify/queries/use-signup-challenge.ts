import request from '@onefootprint/request';
import type {
  ObConfigAuth,
  SignupChallengeResponse,
} from '@onefootprint/types';
import { SANDBOX_ID_HEADER } from '@onefootprint/types';
import type { IdentifyTokenScope } from '@onefootprint/types/src/api/identify-verify';
import { useMutation } from '@tanstack/react-query';

import type { EmailAndOrPhone } from '../types';
import calculateRetryTime from './get-retry-time';

type PayloadPartKey = 'obConfigAuth' | 'sandboxId' | 'scope';
type Payload = EmailAndOrPhone & {
  obConfigAuth?: ObConfigAuth;
  sandboxId?: string;
  scope: IdentifyTokenScope;
};

const requestFn = async (payload: Payload) => {
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
