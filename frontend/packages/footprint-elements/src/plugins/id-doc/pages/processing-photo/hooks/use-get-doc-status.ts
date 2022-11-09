import request, { RequestError } from '@onefootprint/request';
import { GetDocStatusRequest, GetDocStatusResponse } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';

import {
  AUTH_HEADER,
  CLIENT_PUBLIC_KEY_HEADER,
} from '../../../config/constants';
import useIdDocMachine from '../../../hooks/use-id-doc-machine';

const DOC_STATUS_FETCH_INTERVAL = 1000;

const getDocStatus = async (payload: GetDocStatusRequest) => {
  const { authToken, tenantPk } = payload;
  const response = await request<GetDocStatusResponse>({
    method: 'GET',
    url: `/hosted/user/document`,
    headers: {
      [AUTH_HEADER]: authToken,
      [CLIENT_PUBLIC_KEY_HEADER]: tenantPk,
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
  const tenantPk = state.context.tenant?.pk ?? '';

  return useQuery<GetDocStatusResponse, RequestError>(
    ['doc-status', authToken],
    () => getDocStatus({ tenantPk, authToken }),
    {
      refetchInterval: DOC_STATUS_FETCH_INTERVAL,
      enabled: !!authToken && !!tenantPk,
      onSuccess: options.onSuccess,
      onError: options.onError,
    },
  );
};

export default useGetDocStatus;
