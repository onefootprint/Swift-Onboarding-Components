import request from '@onefootprint/request';
import type { AuthMethodKind, ObConfigAuth } from '@onefootprint/types';
import { AUTH_HEADER, SANDBOX_ID_HEADER } from '@onefootprint/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import calculateRetryTime from './get-retry-time';

export type UserChallengeBody = {
  authToken: string;
  actionKind?: 'replace' | 'add'; // Specifies whether to add the new auth method alongside existing auth methods or replace the existing method.
  kind: AuthMethodKind; // The kind of challenge to initiate
  email?: string; // If the challenge kind is email, the email address to send the challenge to
  phoneNumber?: string; // If the challenge kind is SMS, the phone number t
};

export type UserChallengeResponse = {
  biometricChallengeJson?: string;
  challengeToken: string;
  timeBeforeRetryS: number;
  retryDisabledUntil: Date;
};

type PayloadPartKey = 'obConfigAuth' | 'sandboxId';
type Payload = UserChallengeBody & {
  obConfigAuth?: ObConfigAuth;
  sandboxId?: string;
};

const FIVE_MINUTES = 1000 * 60 * 5; // challenges expire after 5 mins

const getQueryKey = (payload: Payload) => {
  const { kind, email, phoneNumber } = payload;
  return ['user-challenge', kind, email, phoneNumber].filter(Boolean);
};

const requestFn = async ({
  actionKind,
  authToken,
  email,
  kind,
  obConfigAuth,
  phoneNumber,
  sandboxId,
}: Payload): Promise<UserChallengeResponse> => {
  const headers: Record<string, string> = { ...obConfigAuth };
  if (sandboxId) {
    headers[SANDBOX_ID_HEADER] = sandboxId;
  }
  if (authToken) {
    headers[AUTH_HEADER] = authToken;
  }

  const response = await request<UserChallengeResponse>({
    method: 'POST',
    url: '/hosted/user/challenge',
    headers,
    data: {
      email,
      kind,
      phone_number: phoneNumber,
      action_kind: actionKind,
    },
  });

  return {
    ...response.data,
    retryDisabledUntil: calculateRetryTime(response.data.timeBeforeRetryS ?? 0),
  };
};

const useUserChallenge = (basePayload: Pick<Payload, PayloadPartKey>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (restOfPayload: Omit<Payload, PayloadPartKey>) => {
      const payload = { ...basePayload, ...restOfPayload };
      const queryKey = getQueryKey(payload);
      const queryState =
        queryClient.getQueryState<UserChallengeResponse>(queryKey);
      if (!queryState) {
        return requestFn(payload);
      }
      const { data } = queryState;

      const disabledUntil = data?.retryDisabledUntil;
      if (disabledUntil && disabledUntil < new Date(Date.now())) {
        return requestFn(payload);
      }

      // If there is an existing challenge, just use it
      if (data) {
        return Promise.resolve(data);
      }
      return requestFn(payload);
    },
    onMutate: async (payload: Payload) => {
      const queryKey = getQueryKey(payload);
      await queryClient.cancelQueries({ queryKey });
    },
    onSuccess: (data: UserChallengeResponse, payload: Payload) => {
      const queryKey = getQueryKey(payload);
      queryClient.setQueryData(queryKey, data);
    },
    cacheTime: FIVE_MINUTES,
  });
};

export default useUserChallenge;
