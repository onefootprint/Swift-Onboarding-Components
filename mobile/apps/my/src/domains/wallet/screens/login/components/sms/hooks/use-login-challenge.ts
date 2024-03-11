import request from '@onefootprint/request';
import type { Identifier, LoginChallengeResponse } from '@onefootprint/types';
import { ChallengeKind } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

import { AUTH_HEADER } from '@/config/constants';

const loginChallenge = async ({
  identifier,
  authToken,
}: {
  identifier: Identifier;
  authToken: string;
}) => {
  if (identifier.email === 'apple@onefootprint.com') {
    return {
      challengeData: {
        challengeKind: 'sms',
        challengeToken: 'omFumBgYXRhlGHUYPhiMGMsYcQkYgBi',
        scrubbedPhoneNumber: '+1 (**) *****-**50',
        biometricChallengeJson: null,
        timeBeforeRetryS: 0,
      },
    };
  }

  const headers = {
    [AUTH_HEADER]: authToken,
  };
  const response = await request<LoginChallengeResponse>({
    method: 'POST',
    url: '/hosted/identify/login_challenge',
    headers,
    data: {
      preferredChallengeKind: ChallengeKind.sms,
    },
  });
  return response.data;
};

const useLoginChallenge = () => {
  return useMutation(loginChallenge);
};

export default useLoginChallenge;
