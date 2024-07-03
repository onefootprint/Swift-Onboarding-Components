import { AUTH_HEADER } from '@onefootprint/types';
import { API_BASE_URL } from 'src/utils/constants';

import type {
  SaveDataRequest,
  SaveDataResponse,
} from '../types/save-request-data';
import { fromUSDateToISO8601Format } from '../utils/date-formatter';

const getDataKind = (data: Record<string, unknown>) => {
  const hasId = Object.entries(data).some(([key]) => key.startsWith('id.'));
  const hasBusiness = Object.entries(data).some(([key]) =>
    key.startsWith('business.'),
  );
  return { hasId, hasBusiness };
};

const removeEmpty = (obj: Record<string, unknown>) => {
  return Object.fromEntries(Object.entries(obj).filter(e => !!e[1]));
};

const formatBeforeSave = (data: Record<string, unknown>) => {
  if (typeof data['id.dob'] === 'string') {
    // eslint-disable-next-line no-param-reassign
    data['id.dob'] = fromUSDateToISO8601Format(data['id.dob']);
  }
  return removeEmpty(data);
};

const save = async (payload: SaveDataRequest) => {
  const data = formatBeforeSave(payload.data);

  if (!Object.entries(data).length) {
    // If there's no data to send to the backend, short circuit
    return {} as SaveDataResponse;
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

  return response.json() as Promise<SaveDataRequest>;
};

export default save;
