import request from '@onefootprint/request';
import type { IdentifyTokenScope, ObConfigAuth, SignupChallengeResponse } from '@onefootprint/types';
import { SANDBOX_ID_HEADER } from '@onefootprint/types';
import { IS_COMPONENTS_SDK_HEADER } from '@onefootprint/types/src/api/identify';
import { useMutation } from '@tanstack/react-query';

import type { UserDatum } from '../../../types';
import calculateRetryTime from './get-retry-time';

type PayloadPartKey = 'obConfigAuth' | 'sandboxId' | 'scope' | 'isComponentsSdk';
type Payload = {
  phoneNumber?: UserDatum<string>;
  email?: UserDatum<string>;
  obConfigAuth?: ObConfigAuth;
  sandboxId?: string;
  scope: IdentifyTokenScope;
  isComponentsSdk: boolean;
};

const requestFn = async (payload: Payload) => {
  const { obConfigAuth, sandboxId, isComponentsSdk, ...restOfPayload } = payload;
  const headers: Record<string, string> = { ...obConfigAuth };
  if (sandboxId) {
    headers[SANDBOX_ID_HEADER] = sandboxId;
  }
  if (isComponentsSdk) {
    headers[IS_COMPONENTS_SDK_HEADER] = 'true';
  }
  const response = await request<SignupChallengeResponse>({
    method: 'POST',
    url: '/hosted/identify/signup_challenge',
    data: {
      ...restOfPayload,
    },
    headers,
  });
  const { challengeData, error } = { ...response.data };
  challengeData.retryDisabledUntil = calculateRetryTime(challengeData.timeBeforeRetryS ?? 0);

  return {
    challengeData,
    error,
  };
};

const useSignupChallenge = (basePayload: Pick<Payload, PayloadPartKey>) =>
  useMutation({
    mutationFn: (restOfPayload: Omit<Payload, PayloadPartKey>) => requestFn({ ...basePayload, ...restOfPayload }),
  });

export default useSignupChallenge;
