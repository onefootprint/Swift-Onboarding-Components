import request, { RequestError } from '@onefootprint/request';
import {
  LoginChallengeRequest,
  LoginChallengeResponse,
} from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

import getRetryDisabledUntil from './utils/get-retry-disabled-until';

const loginChallenge = async (payload: LoginChallengeRequest) => {
  const response = await request<LoginChallengeResponse>({
    method: 'POST',
    url: '/hosted/identify/login_challenge',
    data: payload,
  });
  const { challengeData } = { ...response.data };
  challengeData.retryDisabledUntil = getRetryDisabledUntil(
    challengeData.timeBeforeRetryS ?? 0,
  );

  return {
    challengeData,
  };
};

const useLoginChallenge = () =>
  useMutation<LoginChallengeResponse, RequestError, LoginChallengeRequest>(
    loginChallenge,
  );

export default useLoginChallenge;
