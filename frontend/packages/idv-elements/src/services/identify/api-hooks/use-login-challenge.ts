import request from '@onefootprint/request';
import {
  LoginChallengeRequest,
  LoginChallengeResponse,
} from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

import { ONBOARDING_CONFIG_KEY_HEADER } from '../../../config/constants';
import getRetryDisabledUntil from '../utils/get-retry-disabled-until';

const loginChallenge = async (payload: LoginChallengeRequest) => {
  const { customAuthHeader, tenantPk } = payload;
  const headers =
    customAuthHeader ??
    (tenantPk ? { [ONBOARDING_CONFIG_KEY_HEADER]: tenantPk } : {});

  const response = await request<LoginChallengeResponse>({
    method: 'POST',
    url: '/hosted/identify/login_challenge',
    data: payload,
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

const useLoginChallenge = () => useMutation(loginChallenge);

export default useLoginChallenge;
