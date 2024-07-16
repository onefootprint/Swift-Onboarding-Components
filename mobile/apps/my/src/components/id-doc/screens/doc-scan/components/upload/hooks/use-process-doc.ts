import request from '@onefootprint/request';
import type { ProcessDocRequest, ProcessDocResponse } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

import { AUTH_HEADER } from '@/config/constants';

const processDoc = async (payload: ProcessDocRequest) => {
  const { authToken, id } = payload;
  const response = await request<ProcessDocResponse>({
    method: 'POST',
    url: `/hosted/documents/${id}/process`,
    headers: {
      [AUTH_HEADER]: authToken,
    },
  });

  return response.data;
};

const useProcessDoc = () => useMutation(processDoc);

export default useProcessDoc;
