import { requestWithoutCaseConverter } from '@onefootprint/request';
import {
  UserDataAttribute,
  UserDataRequest,
  UserDataResponse,
} from '@onefootprint/types';
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
      // Don't send null values
      .filter(e => !!e[1])
      // Don't send email or phone number to this endpoint
      .filter(
        e =>
          e[0] !== UserDataAttribute.phoneNumber &&
          e[0] !== UserDataAttribute.email,
      )
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
