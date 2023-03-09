import { requestWithoutCaseConverter } from '@onefootprint/request';
import { BusinessDataRequest, BusinessDataResponse } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

import { AUTH_HEADER } from '../../../../../config/constants';

const businessDataRequest = async (payload: BusinessDataRequest) => {
  // TODO: implement based on api routes
  const response = await requestWithoutCaseConverter<BusinessDataResponse>({
    method: 'POST',
    url: '',
    data: payload,
    headers: {
      [AUTH_HEADER]: payload.authToken,
    },
  });
  return response.data;
};

const useBusinessData = () => useMutation(businessDataRequest);

export default useBusinessData;
