import type {
  LoginChallengeRequest,
  LoginChallengeResponse,
} from '@onefootprint/types';

import { AUTH_HEADER } from '../constants';
import request from '../utils/request';

type Payload = LoginChallengeRequest & {
  authToken: string;
};

const signIn = async ({ authToken, preferredChallengeKind }: Payload) => {
  const response = await request<LoginChallengeResponse>({
    method: 'POST',
    url: '/hosted/identify/login_challenge',
    data: {
      preferredChallengeKind,
    },
    headers: {
      [AUTH_HEADER]: authToken,
    },
  });

  const { challengeData, ...restOfResponse } = { ...response };
  if (challengeData.scrubbedPhoneNumber) {
    challengeData.scrubbedPhoneNumber =
      challengeData.scrubbedPhoneNumber.replace(/\*/g, '•');
  }
  challengeData.retryDisabledUntil = calculateRetryTime(
    challengeData.timeBeforeRetryS ?? 0,
  );

  return {
    challengeData,
    ...restOfResponse,
  };
};

const calculateRetryTime = (timeBeforeRetryS: number): Date => {
  const secondToMilliseconds = 1000;
  return new Date(
    new Date().getTime() + timeBeforeRetryS * secondToMilliseconds,
  );
};

export default signIn;
