import { requestWithoutCaseConverter } from '@onefootprint/request';
import type { BusinessDataRequest, BusinessDataResponse } from '@onefootprint/types';
import { AUTH_HEADER } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

const businessDataRequest = async (payload: BusinessDataRequest) => {
  // Don't send null, undefined, 'decrypted', or falsy values
  const data = Object.fromEntries(
    Object.entries(payload.data).filter(([_key, value]) => !!value && value !== 'decrypted'),
  );

  let method;
  let url;
  if (payload.speculative) {
    method = 'POST';
    url = '/hosted/business/vault/validate';
  } else {
    method = 'PATCH';
    url = '/hosted/business/vault';
  }
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
