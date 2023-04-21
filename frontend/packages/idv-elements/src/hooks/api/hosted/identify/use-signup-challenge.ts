import request from '@onefootprint/request';
import {
  SignupChallengeRequest,
  SignupChallengeResponse,
} from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

import { ONBOARDING_CONFIG_KEY_HEADER } from '../../../../config/constants';
import getRetryDisabledUntil from './utils/get-retry-disabled-until';

const signupChallenge = async (payload: SignupChallengeRequest) => {
  const response = await request<SignupChallengeResponse>({
    method: 'POST',
    url: '/hosted/identify/signup_challenge',
    data: payload,
    headers: payload.tenantPk
      ? { [ONBOARDING_CONFIG_KEY_HEADER]: payload.tenantPk }
      : {},
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
