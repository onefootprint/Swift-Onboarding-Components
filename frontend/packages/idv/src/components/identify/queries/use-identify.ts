import request from '@onefootprint/request';
import type { IdentifyRequest, IdentifyResponse } from '@onefootprint/types';
import { AUTH_HEADER, SANDBOX_ID_HEADER } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

type PayloadPartial = 'obConfigAuth' | 'sandboxId' | 'scope';
type BasePayload = Pick<IdentifyRequest, PayloadPartial>;
export type IdentifyRestOfPayload = Omit<IdentifyRequest, PayloadPartial>;

const requestFn = async ({ phoneNumber, email, authToken, obConfigAuth, sandboxId, scope }: IdentifyRequest) => {
  const headers: Record<string, string> = { ...obConfigAuth };
  const data: Partial<IdentifyRequest> = { scope, email, phoneNumber };

  if (sandboxId) {
    headers[SANDBOX_ID_HEADER] = sandboxId;
  }
  if (authToken) {
    headers[AUTH_HEADER] = authToken;
  }

  const response = await request<IdentifyResponse>({
    method: 'POST',
    url: '/hosted/identify',
    data,
    headers,
  });

  const responseData = { ...response.data };
  if (responseData.user?.availableChallengeKinds.length) {
    responseData.user.availableChallengeKinds = responseData.user.availableChallengeKinds.filter(k => k !== 'sms_link');
  }

  return responseData;
};

const useIdentify = (basePayload: BasePayload) =>
  useMutation({
    mutationFn: (restOfPayload: Partial<BasePayload> & IdentifyRestOfPayload) =>
      requestFn({ ...basePayload, ...restOfPayload }),
  });

export default useIdentify;
