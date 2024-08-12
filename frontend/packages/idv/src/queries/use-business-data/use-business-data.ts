import { requestWithoutCaseConverter } from '@onefootprint/request';
import type { BusinessDataRequest, BusinessDataResponse } from '@onefootprint/types';
import { AUTH_HEADER } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

const businessDataRequest = async (payload: BusinessDataRequest) => {
  // Don't send null, undefined, 'decrypted', or falsy values
  const data = Object.fromEntries(
    Object.entries(payload.data).filter(([_key, value]) => !!value && value !== 'decrypted'),
  );

  const response = await requestWithoutCaseConverter<BusinessDataResponse>({
    method: 'PATCH',
    url: '/hosted/business/vault',
    data,
    headers: {
      [AUTH_HEADER]: payload.authToken,
    },
  });
  return response.data;
};

const useBusinessData = () => useMutation(businessDataRequest);

export default useBusinessData;
