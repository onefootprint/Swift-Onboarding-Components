import { requestWithoutCaseConverter } from '@onefootprint/request';
import { UserDataRequest, UserDataResponse } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

import {
  ALLOW_EXTRA_FIELDS_HEADER,
  AUTH_HEADER,
} from '../../../../../config/constants';

const investorProfileData = async (payload: UserDataRequest) => {
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
      [ALLOW_EXTRA_FIELDS_HEADER]: payload.speculative ? true : undefined,
    },
  });

  return response.data;
};

const useInvestorProfileData = () => useMutation(investorProfileData);

export default useInvestorProfileData;
