import { requestWithoutCaseConverter } from '@onefootprint/request';
import { BusinessDataRequest, BusinessDataResponse } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

import { AUTH_HEADER } from '../../../../../config/constants';

const businessDataRequest = async (payload: BusinessDataRequest) => {
  let method;
  let url;
  if (payload.speculative) {
    method = 'POST';
    url = '/hosted/business/vault/validate';
  } else {
    method = 'PUT';
    url = '/hosted/business/vault';
  }
  const response = await requestWithoutCaseConverter<BusinessDataResponse>({
    method,
    url,
    data: payload,
    headers: {
      [AUTH_HEADER]: payload.authToken,
    },
  });
  return response.data;
};

const useBusinessData = () => useMutation(businessDataRequest);

export default useBusinessData;
