import request, { RequestError } from '@onefootprint/request';
import { GetDocStatusRequest, GetDocStatusResponse } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';

import { useIdScanMachine } from '../../../components/machine-provider';
import BIFROST_AUTH_HEADER from '../../../config/constants';

const DOC_STATUS_FETCH_INTERVAL = 1000;

const getDocStatus = async (payload: GetDocStatusRequest) => {
  const { authToken, id } = payload;
  const response = await request<GetDocStatusResponse>({
    method: 'GET',
    url: `/hosted/user/document/${id}`,
    headers: {
      [BIFROST_AUTH_HEADER]: authToken,
    },
  });
  return response.data;
};

const useGetDocStatus = (
  options: {
    disabled?: boolean;
    onSuccess?: (data: GetDocStatusResponse) => void;
    onError?: (error: RequestError) => void;
  } = {},
) => {
  const [state] = useIdScanMachine();
  const authToken = state.context.authToken ?? '';
  const id = state.context.documentRequestId ?? '';

  return useQuery<GetDocStatusResponse, RequestError>(
    ['doc-status', authToken],
    () => getDocStatus({ id, authToken }),
    {
      refetchInterval: DOC_STATUS_FETCH_INTERVAL,
      enabled: !!authToken && !!id && !options.disabled,
      onSuccess: options.onSuccess,
      onError: options.onError,
    },
  );
};

export default useGetDocStatus;
