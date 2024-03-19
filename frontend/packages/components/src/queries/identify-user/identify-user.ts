import type { IdentifyRequest, IdentifyResponse } from '@onefootprint/types';

import {
  AUTH_HEADER,
  CLIENT_PUBLIC_KEY_HEADER,
  SANDBOX_ID_HEADER,
} from '../../constants';
import request from '../../utils/request';

const identifyUser = async ({
  scope,
  email,
  phoneNumber,
  sandboxId,
  authToken,
  obConfigAuth,
}: Omit<IdentifyRequest, 'obConfigAuth'> & { obConfigAuth?: string }) => {
  const response = await request<IdentifyResponse>({
    url: '/hosted/identify',
    method: 'post',
    headers: {
      [AUTH_HEADER]: authToken,
      [SANDBOX_ID_HEADER]: sandboxId,
      [CLIENT_PUBLIC_KEY_HEADER]: obConfigAuth,
    },
    data: {
      scope,
      email,
      phoneNumber,
    },
  });

  return response;
};

export default identifyUser;
