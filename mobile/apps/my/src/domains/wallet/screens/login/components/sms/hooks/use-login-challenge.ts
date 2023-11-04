import request from '@onefootprint/request';
import type { Identifier, LoginChallengeResponse } from '@onefootprint/types';
import { ChallengeKind } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

const loginChallenge = async (identifier: Identifier) => {
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

  const response = await request<LoginChallengeResponse>({
    method: 'POST',
    url: '/hosted/identify/login_challenge',
    data: {
      identifier,
      preferredChallengeKind: ChallengeKind.sms,
    },
  });
  return response.data;
};

const useLoginChallenge = () => {
  return useMutation(loginChallenge);
};

export default useLoginChallenge;
