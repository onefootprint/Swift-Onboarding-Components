import { requestWithoutCaseConverter } from '@onefootprint/request';
import type { UserDataRequest, UserDataResponse } from '@onefootprint/types';
import { ALLOW_EXTRA_FIELDS_HEADER, AUTH_HEADER } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

import { getLogger } from '../../utils/logger';

const BOOTSTRAP_FIELDS_HEADER = 'X-Fp-Bootstrapped-Fields';
const { logInfo } = getLogger({ location: 'use-user-data' });

const userDataRequest = async (payload: UserDataRequest) => {
  const { data: rawData, bootstrapDis, authToken, allowExtraFields, speculative } = payload;
  const data = Object.fromEntries(
    Object.entries(rawData).filter(
      // Don't send null or undefined or empty values
      e => {
        const isEmpty = !e[1];
        if (isEmpty) {
          // TODO we want to remove this codepath and actually send null values to the backend if
          // the ssn9 is cleared. But we need to first make sure we're not relying on this.
          logInfo(`Skipping empty value for key: ${e[0]}`);
        }
        return !isEmpty;
      },
    ),
  );

  if (!Object.entries(data).length) {
    // If there's no data to send to the backend, short circuit
    return {} as UserDataResponse;
  }

  if (speculative) {
    // used only in investor profile flows
    // we just send data to the backend to validate it
    const response = await requestWithoutCaseConverter<UserDataResponse>({
      method: 'POST',
      url: '/hosted/user/vault/validate',
      data,
      headers: {
        [AUTH_HEADER]: authToken,
        [ALLOW_EXTRA_FIELDS_HEADER]: !!allowExtraFields,
      },
    });
    return response.data;
  }

  const headers: Record<string, string> = { [AUTH_HEADER]: authToken };
  if (bootstrapDis.length) {
    headers[BOOTSTRAP_FIELDS_HEADER] = bootstrapDis.join(',');
  }

  // used for kyc flows
  const response = await requestWithoutCaseConverter<UserDataResponse>({
    method: 'PATCH',
    url: '/hosted/user/vault',
    data,
    headers,
  });
  return response.data;
};

const useUserData = () => useMutation(userDataRequest);

export default useUserData;
