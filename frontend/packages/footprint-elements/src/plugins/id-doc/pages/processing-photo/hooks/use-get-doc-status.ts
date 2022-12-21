import request, { RequestError } from '@onefootprint/request';
import { GetDocStatusRequest, GetDocStatusResponse } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';

import { AUTH_HEADER } from '../../../config/constants';
import useIdDocMachine from '../../../hooks/use-id-doc-machine';

const DOC_STATUS_FETCH_INTERVAL = 1000;

const getDocStatus = async (payload: GetDocStatusRequest) => {
  const { authToken, documentRequestId } = payload;
  const response = await request<GetDocStatusResponse>({
    method: 'GET',
    url: `/hosted/user/document/${documentRequestId}/status`,
    headers: {
      [AUTH_HEADER]: authToken,
    },
  });
  return response.data;
};

const useGetDocStatus = (
  options: {
    onSuccess?: (data: GetDocStatusResponse) => void;
    onError?: (error: RequestError) => void;
  } = {},
) => {
  const [state] = useIdDocMachine();
  const authToken = state.context.authToken ?? '';
  const documentRequestId = state.context.documentRequestId ?? '';

  return useQuery<GetDocStatusResponse, RequestError>(
    ['doc-status', authToken],
    () => getDocStatus({ authToken, documentRequestId }),
    {
      refetchInterval: DOC_STATUS_FETCH_INTERVAL,
      enabled: !!authToken,
      onSuccess: options.onSuccess,
      onError: options.onError,
    },
  );
};

export default useGetDocStatus;
