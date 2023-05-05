import request from '@onefootprint/request';
import {
  LoginChallengeRequest,
  LoginChallengeResponse,
} from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

import getRetryDisabledUntil from './utils/get-retry-disabled-until';

const loginChallenge = async (payload: LoginChallengeRequest) => {
  const { obConfigAuth, identifier, preferredChallengeKind } = payload;
  const response = await request<LoginChallengeResponse>({
    method: 'POST',
    url: '/hosted/identify/login_challenge',
    data: {
      identifier,
      preferredChallengeKind,
    },
    headers: obConfigAuth,
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
