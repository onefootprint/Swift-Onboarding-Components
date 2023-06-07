import request from '@onefootprint/request';
import { SubmitDocRequest, SubmitDocResponse } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

import { AUTH_HEADER } from '../../../../../config/constants';

const submitDoc = async (payload: SubmitDocRequest) => {
  const {
    authToken,
    frontImage,
    backImage,
    selfieImage,
    documentType,
    countryCode,
  } = payload;
  const response = await request<SubmitDocResponse>({
    method: 'POST',
    url: '/hosted/user/document',
    data: {
      frontImage,
      backImage,
      selfieImage,
      documentType,
      countryCode,
    },
    headers: {
      [AUTH_HEADER]: authToken,
    },
  });

  return response.data;
};

const useSubmitDoc = () => useMutation(submitDoc);

export default useSubmitDoc;
