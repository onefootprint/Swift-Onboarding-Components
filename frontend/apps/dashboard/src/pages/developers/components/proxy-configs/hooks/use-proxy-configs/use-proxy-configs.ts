import request, { getErrorMessage } from '@onefootprint/request';
import { GetProxyConfigsResponse } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import useSession, { AuthHeaders } from 'src/hooks/use-session';

import { LIST_QUERY_KEY } from '@/proxy-configs/constants';

const getProxyConfigs = async (authHeaders: AuthHeaders) => {
  const response = await request<GetProxyConfigsResponse>({
    method: 'GET',
    url: '/org/proxy_configs',
    headers: authHeaders,
  });

  return response.data;
};

const useProxyConfigs = () => {
  const { authHeaders } = useSession();
  const proxyConfigsQuery = useQuery([LIST_QUERY_KEY], () =>
    getProxyConfigs(authHeaders),
  );
  const { error, data = [] } = proxyConfigsQuery;
  return {
    ...proxyConfigsQuery,
    errorMessage: error ? getErrorMessage(error) : undefined,
    data,
  };
};

export default useProxyConfigs;
