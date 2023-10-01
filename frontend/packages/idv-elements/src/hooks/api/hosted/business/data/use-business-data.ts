import { requestWithoutCaseConverter } from '@onefootprint/request';
import type {
  BusinessDataRequest,
  BusinessDataResponse,
} from '@onefootprint/types';
import { AUTH_HEADER } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

const businessDataRequest = async (payload: BusinessDataRequest) => {
  let method;
  let url;
  if (payload.speculative) {
    method = 'POST';
    url = '/hosted/business/vault/validate';
  } else {
    method = 'PATCH';
    url = '/hosted/business/vault';
  }
  // Transform the data into the format expected by the API
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

  const response = await requestWithoutCaseConverter<BusinessDataResponse>({
    method,
    url,
    data,
    headers: {
      [AUTH_HEADER]: payload.authToken,
    },
  });
  return response.data;
};

const useBusinessData = () => useMutation(businessDataRequest);

export default useBusinessData;
