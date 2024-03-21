import type { SignupChallengeResponse } from '@onefootprint/types';

import { CLIENT_PUBLIC_KEY_HEADER, SANDBOX_ID_HEADER } from '../constants';
import request from '../utils/request';

// TODO: Adjust
type SignupChallengeRequest = {
  email?: string;
  obConfigAuth?: string;
  phoneNumber?: string;
  sandboxId?: string;
  scope: string;
};

const signup = async ({
  obConfigAuth,
  sandboxId,
  ...payload
}: SignupChallengeRequest) => {
  const response = await request<SignupChallengeResponse>({
    method: 'POST',
    url: '/hosted/identify/signup_challenge',
    headers: {
      [CLIENT_PUBLIC_KEY_HEADER]: obConfigAuth,
      [SANDBOX_ID_HEADER]: sandboxId,
    },
    data: {
      ...payload,
    },
  });

  const { challengeData, error } = { ...response };
  challengeData.retryDisabledUntil = calculateRetryTime(
    challengeData.timeBeforeRetryS ?? 0,
  );

  return {
    challengeData,
    error,
  };
};

const calculateRetryTime = (timeBeforeRetryS: number): Date => {
  const secondToMilliseconds = 1000;
  return new Date(
    new Date().getTime() + timeBeforeRetryS * secondToMilliseconds,
  );
};

export default signup;
