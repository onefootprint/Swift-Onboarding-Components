import request, { RequestError } from '@onefootprint/request';
import { SubmitDocRequest, SubmitDocResponse } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

import BIFROST_AUTH_HEADER from '../../../config/constants';

const submitDoc = async (payload: SubmitDocRequest) => {
  const { authToken, id, frontImage, backImage, documentType, countryCode } =
    payload;
  const response = await request<SubmitDocResponse>({
    method: 'POST',
    url: `/hosted/user/document/${id}`,
    data: {
      frontImage,
      backImage,
      documentType,
      countryCode,
    },
    headers: {
      [BIFROST_AUTH_HEADER]: authToken,
    },
  });

  return response.data;
};

const useSubmitDoc = () =>
  useMutation<SubmitDocResponse, RequestError, SubmitDocRequest>(submitDoc);

export default useSubmitDoc;
