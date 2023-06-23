import request from '@onefootprint/request';
import {
  LoginChallengeRequest,
  LoginChallengeResponse,
} from '@onefootprint/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import getRetryDisabledUntil from './utils/get-retry-disabled-until';

const QUERY_CACHE_LIMIT = 1000 * 60 * 5; // challenges expire after 5 mins

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

const getQueryKeyForPayload = (payload: LoginChallengeRequest) => {
  const { identifier, preferredChallengeKind } = payload;
  return ['login-challenge', identifier, preferredChallengeKind];
};

const useLoginChallenge = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (payload: LoginChallengeRequest) => {
      const queryKey = getQueryKeyForPayload(payload);
      const queryState =
        queryClient.getQueryState<LoginChallengeResponse>(queryKey);
      if (!queryState) {
        return loginChallenge(payload);
      }

      const { data } = queryState;
      if (data) {
        return Promise.resolve(data);
      }
      return loginChallenge(payload);
    },
    {
      onMutate: async payload => {
        const queryKey = getQueryKeyForPayload(payload);
        await queryClient.cancelQueries(queryKey);
      },
      onSuccess: (data, payload) => {
        const queryKey = getQueryKeyForPayload(payload);
        queryClient.setQueryData(queryKey, data);
      },
      cacheTime: QUERY_CACHE_LIMIT,
    },
  );
};

export default useLoginChallenge;
