import request, { RequestError } from '@onefootprint/request';
import {
  SignupChallengeRequest,
  SignupChallengeResponse,
} from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

import getRetryDisabledUntil from './utils/get-retry-disabled-until';

const signupChallenge = async (payload: SignupChallengeRequest) => {
  const response = await request<SignupChallengeResponse>({
    method: 'POST',
    url: '/hosted/identify/signup_challenge',
    data: payload,
  });
  const { challengeToken, timeBeforeRetryS } = response.data;

  return {
    challengeToken,
    retryDisabledUntil: getRetryDisabledUntil(timeBeforeRetryS ?? 0),
  };
};

const useSignupChallenge = () =>
  useMutation<SignupChallengeResponse, RequestError, SignupChallengeRequest>(
    signupChallenge,
  );

export default useSignupChallenge;
