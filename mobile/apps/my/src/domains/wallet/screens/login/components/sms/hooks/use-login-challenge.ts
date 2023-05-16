import request from '@onefootprint/request';
import {
  ChallengeKind,
  Identifier,
  LoginChallengeResponse,
} from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

const loginChallenge = async (identifier: Identifier) => {
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
