import request from '@onefootprint/request';
import type {
  ProcessDocRequest,
  ProcessDocResponse,
} from '@onefootprint/types';
import { AUTH_HEADER } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

const processDoc = async (payload: ProcessDocRequest) => {
  const { authToken, id } = payload;
  const response = await request<ProcessDocResponse>({
    method: 'POST',
    url: `/hosted/user/documents/${id}/process`,
    headers: {
      [AUTH_HEADER]: authToken,
    },
  });

  return response.data;
};

const useProcessDoc = () => useMutation(processDoc, { retry: 2 }); // Sometimes the processing request might erroneously fail although BE successfully processes it, so we try twice

export default useProcessDoc;
