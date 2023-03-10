import { requestWithoutCaseConverter } from '@onefootprint/request';
import {
  BusinessDataAttribute,
  BusinessDataRequest,
  BusinessDataResponse,
} from '@onefootprint/types';
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
  // Transform the data into the format expected by the API
  const data = Object.fromEntries(
    Object.entries(payload.data)
      // Don't send null values
      .filter(e => !!e[1])
      .map(([k, v]) => [`business.${k}`, v]),
  );

  // Stringify all beneficial owners data and send as one field
  const beneficialOwners = payload.data[BusinessDataAttribute.beneficialOwners];
  if (beneficialOwners) {
    data[`business.${BusinessDataAttribute.beneficialOwners}`] =
      JSON.stringify(beneficialOwners);
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
