import { requestWithoutCaseConverter } from '@onefootprint/request';
import { UserDataRequest, UserDataResponse } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

import { AUTH_HEADER } from '../../../../../config/constants';

const userDataRequest = async (payload: UserDataRequest) => {
  let url;
  if (payload.speculative) {
    // For some requests, we just send data to the backend to validate it
    url = '/hosted/user/data/identity/validate';
  } else {
    url = '/hosted/user/data/identity';
  }
  // Transform the data into the format expected by the API
  const data = Object.fromEntries(
    Object.entries(payload.data)
      .filter(e => !!e[1])
      .map(([k, v]) => [`id.${k}`, v]),
  );
  const response = await requestWithoutCaseConverter<UserDataResponse>({
    method: 'POST',
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
