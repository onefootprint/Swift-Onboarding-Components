import request from '@onefootprint/request';
import {
  SubmitDocTypeRequest,
  SubmitDocTypeResponse,
} from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

import { AUTH_HEADER } from '../../../../../config/constants';

const submitDocType = async (payload: SubmitDocTypeRequest) => {
  const { authToken, documentType, countryCode, fixtureResult } = payload;
  const response = await request<SubmitDocTypeResponse>({
    method: 'POST',
    url: '/hosted/user/documents',
    data: {
      documentType,
      countryCode,
      fixtureResult,
    },
    headers: {
      [AUTH_HEADER]: authToken,
    },
  });

  return response.data;
};

const useSubmitDocType = () => useMutation(submitDocType);

export default useSubmitDocType;
