import request from '@onefootprint/request';
import type { ProcessDocRequest, ProcessDocResponse } from '@onefootprint/types';
import { AUTH_HEADER } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

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

const useProcessDoc = () => {
  return useMutation({
    mutationFn: processDoc,
  });
};

export default useProcessDoc;
