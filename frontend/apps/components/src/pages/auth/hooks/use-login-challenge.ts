import request from '@onefootprint/request';
import type {
  LoginChallengeRequest,
  LoginChallengeResponse,
} from '@onefootprint/types';
import { SANDBOX_ID_HEADER } from '@onefootprint/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { EmailAndOrPhone } from '../types';
import getRetryDisabledUntil from './get-retry-disabled-until';

type Payload = Omit<LoginChallengeRequest, 'identifier'> & {
  identifier: EmailAndOrPhone;
};

const QUERY_CACHE_LIMIT = 1000 * 60 * 5; // challenges expire after 5 mins

const loginChallenge = async (payload: Payload) => {
  const { obConfigAuth, identifier, preferredChallengeKind, sandboxId } =
    payload;
  const headers: Record<string, string> = { ...obConfigAuth };
  if (sandboxId) {
    headers[SANDBOX_ID_HEADER] = sandboxId;
  }

  const response = await request<LoginChallengeResponse>({
    method: 'POST',
    url: '/hosted/identify/login_challenge',
    data: {
      preferredChallengeKind,
      identifier,
    },
    headers,
  });
  const { challengeData, error } = { ...response.data };
  challengeData.retryDisabledUntil = getRetryDisabledUntil(
    challengeData.timeBeforeRetryS ?? 0,
  );

  return {
    challengeData,
    error,
  };
};

const getQueryKeyForPayload = (payload: Payload) => {
  const { identifier, preferredChallengeKind } = payload;
  return ['login-challenge', identifier, preferredChallengeKind];
};

const useLoginChallenge = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (challengeRequest: Payload) => {
      const { isResend, ...payload } = challengeRequest;
      const queryKey = getQueryKeyForPayload(payload);
      const queryState =
        queryClient.getQueryState<LoginChallengeResponse>(queryKey);
      if (!queryState) {
        return loginChallenge(payload);
      }

      const { data } = queryState;
      // If we want to retry the challenge and rate limiting allows it,
      // then initiate a new challenge
      const disabledUntil = data?.challengeData.retryDisabledUntil;
      if (isResend && disabledUntil && disabledUntil < new Date(Date.now())) {
        return loginChallenge(payload);
      }

      // If there is an existing challenge, just use it
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
