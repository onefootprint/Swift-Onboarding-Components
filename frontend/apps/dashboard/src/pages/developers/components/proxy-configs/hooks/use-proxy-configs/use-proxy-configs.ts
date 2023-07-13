import request, { getErrorMessage } from '@onefootprint/request';
import {
  GetProxyConfigsRequest,
  GetProxyConfigsResponse,
} from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import useSession, { AuthHeaders } from 'src/hooks/use-session';

import { QUERY_KEY } from '@/proxy-configs/constants';

const getProxyConfigs = async (
  authHeaders: AuthHeaders,
  filters?: GetProxyConfigsRequest,
) => {
  const response = await request<GetProxyConfigsResponse>({
    method: 'GET',
    url: '/org/proxy_configs',
    headers: authHeaders,
    params: filters,
  });

  return response.data;
};

const useProxyConfigs = (filters?: GetProxyConfigsRequest) => {
  const { authHeaders, isLive } = useSession();

  const proxyConfigsQuery = useQuery([QUERY_KEY, filters, isLive], () =>
    getProxyConfigs(authHeaders, filters),
  );
  const { error, data = [] } = proxyConfigsQuery;
  return {
    ...proxyConfigsQuery,
    errorMessage: error ? getErrorMessage(error) : undefined,
    data,
  };
};

export default useProxyConfigs;
