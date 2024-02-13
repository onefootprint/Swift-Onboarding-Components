import request from '@onefootprint/request';
import type { IdentifyRequest, IdentifyResponse } from '@onefootprint/types';
import { AUTH_HEADER, SANDBOX_ID_HEADER } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

type PayloadPartKey = 'obConfigAuth' | 'sandboxId';
const requestFn = async ({
  identifier,
  obConfigAuth,
  sandboxId,
}: IdentifyRequest) => {
  const headers: Record<string, string> = { ...obConfigAuth };
  const data: Partial<IdentifyRequest> = {};

  if (sandboxId) {
    headers[SANDBOX_ID_HEADER] = sandboxId;
  }
  if ('authToken' in identifier) {
    headers[AUTH_HEADER] = identifier.authToken;
  } else {
    data.identifier = identifier;
  }

  const response = await request<IdentifyResponse>({
    method: 'POST',
    url: '/hosted/identify',
    data,
    headers,
  });

  if (response.data.user?.scrubbedEmail) {
    response.data.user.scrubbedEmail =
      response.data.user.scrubbedEmail.replaceAll('*', '•');
  }
  if (response.data.user?.scrubbedPhone) {
    response.data.user.scrubbedPhone =
      response.data.user.scrubbedPhone.replaceAll('*', '•');
  }

  return response.data;
};

const useIdentify = (basePayload: Pick<IdentifyRequest, PayloadPartKey>) =>
  useMutation({
    mutationFn: (restOfPayload: Omit<IdentifyRequest, PayloadPartKey>) =>
      requestFn({ ...basePayload, ...restOfPayload }),
  });

export default useIdentify;
