import type { UserDataRequest, UserDataResponse } from '@onefootprint/types';

import { AUTH_HEADER } from '../constants';
import request from '../utils/request';

const removeEmpty = (obj: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(obj).filter(e => !!e[1]));

const save = async (payload: UserDataRequest) => {
  const data = removeEmpty(payload.data);
  const hasData = Object.entries(data).length;
  if (!hasData) {
    return {} as UserDataResponse;
  }

  const response = await request<UserDataResponse>({
    method: 'PATCH',
    url: '/hosted/user/vault',
    data,
    disableCaseConverter: true,
    headers: {
      [AUTH_HEADER]: payload.authToken,
    },
  });

  return response;
};

export default save;
