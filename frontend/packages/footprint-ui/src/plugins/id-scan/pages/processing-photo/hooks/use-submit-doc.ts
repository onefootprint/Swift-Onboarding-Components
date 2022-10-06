import request, { RequestError } from '@onefootprint/request';
import { SubmitDocRequest, SubmitDocResponse } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

import {
  AUTH_HEADER,
  CLIENT_PUBLIC_KEY_HEADER,
} from '../../../config/constants';

const submitDoc = async (payload: SubmitDocRequest) => {
  const {
    authToken,
    tenantPk,
    frontImage,
    backImage,
    documentType,
    countryCode,
  } = payload;
  const response = await request<SubmitDocResponse>({
    method: 'POST',
    url: `/hosted/user/document`,
    data: {
      frontImage,
      backImage,
      documentType,
      countryCode,
    },
    headers: {
      [AUTH_HEADER]: authToken,
      [CLIENT_PUBLIC_KEY_HEADER]: tenantPk,
    },
  });

  return response.data;
};

const useSubmitDoc = () =>
  useMutation<SubmitDocResponse, RequestError, SubmitDocRequest>(submitDoc);

export default useSubmitDoc;
