import type { UserDataRequest, UserDataResponse } from '@onefootprint/types';

import { AUTH_HEADER } from '../../../constants';
import request from '../utils/request';

const getDataKind = (data: Record<string, unknown>) => {
  const hasId = Object.entries(data).some(([key]) => key.startsWith('id.'));
  const hasBusiness = Object.entries(data).some(([key]) => key.startsWith('business.'));
  return { hasId, hasBusiness };
};

const vault = async (payload: UserDataRequest) => {
  const data = payload.data;
  const hasData = Object.entries(data).length;
  if (!hasData) {
    return {} as UserDataResponse;
  }

  const { hasId, hasBusiness } = getDataKind(data);
  if (hasId && hasBusiness) {
    throw new Error("You can't submit id and business at the same time");
  }

  const response = await request<UserDataResponse>({
    method: 'PATCH',
    url: hasBusiness ? '/hosted/business/vault' : '/hosted/user/vault',
    data,
    disableCaseConverter: true,
    headers: {
      [AUTH_HEADER]: payload.authToken,
    },
  });

  return response;
};

export default vault;
