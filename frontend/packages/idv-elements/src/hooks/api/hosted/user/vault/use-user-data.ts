import { requestWithoutCaseConverter } from '@onefootprint/request';
import { IdDI, UserDataRequest, UserDataResponse } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

import { AUTH_HEADER } from '../../../../../config/constants';

const userDataRequest = async (payload: UserDataRequest) => {
  let method;
  let url;
  if (payload.speculative) {
    // For some requests, we just send data to the backend to validate it
    method = 'POST';
    url = '/hosted/user/vault/validate';
  } else {
    method = 'PUT';
    url = '/hosted/user/vault';
  }

  const data = Object.fromEntries(
    Object.entries(payload.data)
      // Don't send null values
      .filter(e => !!e[1])
      .filter(e => e[0] !== IdDI.phoneNumber && e[0] !== IdDI.email)
      .map(([k, v]) => {
        // The backend expects stringified objects/arrays
        if (typeof v === 'object') {
          return [k, JSON.stringify(v)];
        }
        return [k, v];
      }),
  );

  const response = await requestWithoutCaseConverter<UserDataResponse>({
    method,
    url,
    data,
    headers: {
      [AUTH_HEADER]: payload.authToken,
    },
  });
  return response.data;
};

const useUserData = () => useMutation(userDataRequest);

export default useUserData;
