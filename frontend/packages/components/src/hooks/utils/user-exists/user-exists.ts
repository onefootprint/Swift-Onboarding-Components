import type { IdentifyRequest, IdentifyResponse } from '@onefootprint/types';

import request from '../request';

const identifyUserRequest = async (payload: IdentifyRequest) => {
  const response = await request<IdentifyResponse>({
    url: '/hosted/identify',
    method: 'post',
    data: payload,
  });
  return response;
};

const userExists = async ({
  email,
  phoneNumber,
  sandboxId,
}: {
  email: string;
  phoneNumber: string;
  sandboxId?: string;
}) => {
  if (email) {
    const result = await identifyUserRequest({
      email,
      scope: 'onboarding',
      sandboxId,
    });
    if (result) return true;
  }
  if (phoneNumber) {
    const result = await identifyUserRequest({
      phoneNumber,
      scope: 'onboarding',
      sandboxId,
    });
    return result;
  }
  return false;
};

export default userExists;
