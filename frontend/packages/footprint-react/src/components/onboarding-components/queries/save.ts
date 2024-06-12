import { dateToIso8601 } from '@onefootprint/core';
import type { UserDataRequest, UserDataResponse } from '@onefootprint/types';

import { AUTH_HEADER } from '../../../constants';
import request from '../utils/request';

const getDataKind = (data: Record<string, unknown>) => {
  const hasId = Object.entries(data).some(([key]) => key.startsWith('id.'));
  const hasBusiness = Object.entries(data).some(([key]) => key.startsWith('business.'));
  return { hasId, hasBusiness };
};

const removeEmpty = (obj: Record<string, unknown>) => {
  return Object.fromEntries(Object.entries(obj).filter(e => !!e[1]));
};

const formatBeforeSave = (data: Record<string, unknown>) => {
  if (typeof data['id.dob'] === 'string') {
    data['id.dob'] = dateToIso8601(data['id.dob']);
  }
  return removeEmpty(data);
};

const save = async (payload: UserDataRequest) => {
  const data = formatBeforeSave(payload.data);
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

export default save;
