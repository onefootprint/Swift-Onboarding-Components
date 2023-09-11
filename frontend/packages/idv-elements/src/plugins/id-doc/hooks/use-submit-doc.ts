import request from '@onefootprint/request';
import type { SubmitDocRequest, SubmitDocResponse } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

import { AUTH_HEADER } from '../config/constants';

const submitDoc = async (payload: SubmitDocRequest) => {
  const { authToken, image, side, mimeType, id } = payload;
  const response = await request<SubmitDocResponse>({
    method: 'POST',
    url: `/hosted/user/documents/${id}/upload`,
    data: {
      image,
      side,
      mimeType,
    },
    headers: {
      [AUTH_HEADER]: authToken,
    },
  });

  return response.data;
};

const useSubmitDoc = () => useMutation(submitDoc);

export default useSubmitDoc;
