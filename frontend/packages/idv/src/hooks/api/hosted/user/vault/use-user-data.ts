import { requestWithoutCaseConverter } from '@onefootprint/request';
import type { UserDataRequest, UserDataResponse } from '@onefootprint/types';
import { ALLOW_EXTRA_FIELDS_HEADER, AUTH_HEADER } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

const userDataRequest = async (payload: UserDataRequest) => {
  const data = Object.fromEntries(
    Object.entries(payload.data).filter(
      // Don't send null or undefined or empty values
      // Empty string is a valid value to send to the backend
      e => Boolean(e[1]),
    ),
  );

  if (!Object.entries(data).length) {
    // If there's no data to send to the backend, short circuit
    return {} as UserDataResponse;
  }

  if (payload.speculative) {
    // used only in investor profile flows
    // we just send data to the backend to validate it
    const response = await requestWithoutCaseConverter<UserDataResponse>({
      method: 'POST',
      url: '/hosted/user/vault/validate',
      data,
      headers: {
        [AUTH_HEADER]: payload.authToken,
        [ALLOW_EXTRA_FIELDS_HEADER]: !!payload.allowExtraFields,
      },
    });
    return response.data;
  }

  // used for kyc flows
  const response = await requestWithoutCaseConverter<UserDataResponse>({
    method: 'PATCH',
    url: '/hosted/user/vault',
    data,
    headers: {
      [AUTH_HEADER]: payload.authToken,
    },
  });
  return response.data;
};

const useUserData = () => useMutation(userDataRequest);

export default useUserData;
