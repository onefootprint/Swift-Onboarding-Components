import { requestWithoutCaseConverter } from '@onefootprint/request';
import type { UserDataRequest, UserDataResponse } from '@onefootprint/types';
import { ALLOW_EXTRA_FIELDS_HEADER, AUTH_HEADER, IdDI } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

const userDataRequest = async (payload: UserDataRequest) => {
  let method;
  let url;
  if (payload.speculative) {
    // For some requests, we just send data to the backend to validate it
    method = 'POST';
    url = '/hosted/user/vault/validate';
  } else {
    method = 'PATCH';
    url = '/hosted/user/vault';
  }

  const data = Object.fromEntries(
    Object.entries(payload.data).filter(
      // Don't send null values
      e => !!e[1] && e[0] !== IdDI.phoneNumber && e[0] !== IdDI.email,
    ),
  );

  if (!Object.entries(data).length) {
    // If there's no data to send to the backend, short circuit
    return {} as UserDataResponse;
  }
  const response = await requestWithoutCaseConverter<UserDataResponse>({
    method,
    url,
    data,
    headers: {
      [AUTH_HEADER]: payload.authToken,
      [ALLOW_EXTRA_FIELDS_HEADER]: payload.speculative && payload.allowExtraFields ? true : undefined,
    },
  });
  return response.data;
};

const useUserData = () => useMutation(userDataRequest);

export default useUserData;
