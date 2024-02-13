import request from '@onefootprint/request';
import { AUTH_HEADER, SANDBOX_ID_HEADER } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

type PayloadPartKey = 'sandboxId';
type UserChallengeVerifyBody = {
  authToken: string;
  challengeResponse: string; // The response to the challenge. Either SMS/email PIN code or passkey response
  challengeToken: string; // The token given from initiating the challenge
};
type UserChallengeVerifyResponse = {};
type Payload = UserChallengeVerifyBody & { sandboxId?: string };

const requestFn = async ({
  authToken,
  challengeResponse,
  challengeToken,
  sandboxId,
}: Payload) => {
  const headers: Record<string, string> = {};
  if (sandboxId) {
    headers[SANDBOX_ID_HEADER] = sandboxId;
  }
  if (authToken) {
    headers[AUTH_HEADER] = authToken;
  }

  const response = await request<UserChallengeVerifyResponse>({
    method: 'POST',
    url: '/hosted/user/challenge/verify',
    headers,
    data: { challengeResponse, challengeToken },
  });

  return response.data;
};

const useUserChallengeVerify = (basePayload: Pick<Payload, PayloadPartKey>) =>
  useMutation({
    mutationFn: (restOfPayload: Omit<Payload, PayloadPartKey>) =>
      requestFn({ ...basePayload, ...restOfPayload }),
  });

export default useUserChallengeVerify;
