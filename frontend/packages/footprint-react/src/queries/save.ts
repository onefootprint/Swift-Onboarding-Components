import type {
  PublicOnboardingConfig,
  UserDataRequest,
  UserDataResponse,
} from '@onefootprint/types';

import { AUTH_HEADER } from '../constants';
import request from '../utils/request';

const removeEmpty = (obj: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(obj).filter(e => !!e[1]));

const save = async (
  payload: UserDataRequest,
  onboardingConfig: PublicOnboardingConfig,
) => {
  const data = removeEmpty(payload.data);
  const hasData = Object.entries(data).length;
  if (!hasData) {
    return {} as UserDataResponse;
  }

  const response = await request<UserDataResponse>({
    method: 'PATCH',
    url:
      onboardingConfig.kind === 'kyc'
        ? '/hosted/user/vault'
        : '/hosted/business/vault',
    data,
    disableCaseConverter: true,
    headers: {
      [AUTH_HEADER]: payload.authToken,
    },
  });

  return response;
};

export default save;
