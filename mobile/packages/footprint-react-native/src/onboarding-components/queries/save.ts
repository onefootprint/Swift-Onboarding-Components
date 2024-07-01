import type { UserDataRequest, UserDataResponse } from '@onefootprint/types';
import { AUTH_HEADER } from '@onefootprint/types';
import { API_BASE_URL } from 'src/utils/constants';

const getDataKind = (data: Record<string, unknown>) => {
  const hasId = Object.entries(data).some(([key]) => key.startsWith('id.'));
  const hasBusiness = Object.entries(data).some(([key]) =>
    key.startsWith('business.'),
  );
  return { hasId, hasBusiness };
};

const save = async (payload: UserDataRequest) => {
  const data = Object.fromEntries(
    Object.entries(payload.data).filter(
      // Don't send null values
      e => !!e[1],
    ),
  );

  if (!Object.entries(data).length) {
    // If there's no data to send to the backend, short circuit
    return {} as UserDataResponse;
  }

  const { hasId, hasBusiness } = getDataKind(data);
  if (hasId && hasBusiness) {
    throw new Error("You can't submit id and business at the same time");
  }

  const url = hasBusiness ? '/hosted/business/vault' : '/hosted/user/vault';

  const response = await fetch(`${API_BASE_URL}${url}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
    headers: {
      [AUTH_HEADER]: payload.authToken,
    },
  });

  if (!response.ok) throw new Error('Failed to save data');

  return response.json() as Promise<UserDataResponse>;
};

export default save;
