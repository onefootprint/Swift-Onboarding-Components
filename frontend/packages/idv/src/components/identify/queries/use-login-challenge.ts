import request from '@onefootprint/request';
import type { LoginChallengeRequest, LoginChallengeResponse } from '@onefootprint/types';
import { AUTH_HEADER } from '@onefootprint/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import calculateRetryTime from './get-retry-time';

type Payload = LoginChallengeRequest & {
  authToken: string;
};

const FIVE_MINUTES = 1000 * 60 * 5; // challenges expire after 5 mins

const getQueryKeyForPayload = (payload: Payload) => {
  const { authToken, preferredChallengeKind } = payload;
  return ['login-challenge', authToken, preferredChallengeKind];
};

const requestFn = async ({ authToken, preferredChallengeKind }: Payload) => {
  const headers: Record<string, string> = { [AUTH_HEADER]: authToken };

  const response = await request<LoginChallengeResponse>({
    method: 'POST',
    url: '/hosted/identify/login_challenge',
    data: {
      preferredChallengeKind,
    },
    headers,
  });
  const { challengeData, ...restOfResponse } = { ...response.data };
  challengeData.retryDisabledUntil = calculateRetryTime(challengeData.timeBeforeRetryS ?? 0);

  return {
    challengeData,
    ...restOfResponse,
  };
};

const useLoginChallenge = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ isResend, ...payload }: Payload) => {
      const queryKey = getQueryKeyForPayload(payload);
      const queryState = queryClient.getQueryState<LoginChallengeResponse>(queryKey);
      if (!queryState) {
        return requestFn(payload);
      }

      const { data } = queryState;
      // If we want to retry the challenge and rate limiting allows it,
      // then initiate a new challenge
      const disabledUntil = data?.challengeData.retryDisabledUntil;
      if (isResend && disabledUntil && disabledUntil < new Date(Date.now())) {
        return requestFn(payload);
      }

      // If there is an existing challenge, just use it
      if (data) {
        return Promise.resolve(data);
      }
      return requestFn(payload);
    },
    onMutate: async payload => {
      const queryKey = getQueryKeyForPayload(payload);
      await queryClient.cancelQueries({ queryKey });
    },
    onSuccess: (data, payload) => {
      const queryKey = getQueryKeyForPayload(payload);
      queryClient.setQueryData(queryKey, data);
    },
    cacheTime: FIVE_MINUTES,
  });
};

export default useLoginChallenge;
