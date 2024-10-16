import request, { getErrorMessage } from '@onefootprint/request';
import type { GetProxyConfigsRequest, GetProxyConfigsResponse } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

const getProxyConfigs = async (authHeaders: AuthHeaders, filters?: GetProxyConfigsRequest) => {
  const response = await request<GetProxyConfigsResponse>({
    method: 'GET',
    url: '/org/proxy_configs',
    headers: authHeaders,
    params: filters,
  });

  return response.data;
};

const useProxyConfigs = (filters?: GetProxyConfigsRequest) => {
  const { authHeaders } = useSession();

  const proxyConfigsQuery = useQuery({
    queryKey: ['proxy-configs', filters, authHeaders],
    queryFn: () => getProxyConfigs(authHeaders, filters),
  });

  const { error, data = [] } = proxyConfigsQuery;
  return {
    ...proxyConfigsQuery,
    errorMessage: error ? getErrorMessage(error) : undefined,
    data,
  };
};

export default useProxyConfigs;
