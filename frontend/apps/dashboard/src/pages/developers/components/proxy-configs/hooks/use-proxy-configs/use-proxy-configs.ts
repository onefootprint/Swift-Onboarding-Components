import request, { getErrorMessage } from '@onefootprint/request';
import { GetProxyConfigsResponse } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import useSession, { AuthHeaders } from 'src/hooks/use-session';

import { QUERY_KEY } from '@/proxy-configs/constants';

const getProxyConfigs = async (authHeaders: AuthHeaders) => {
  const response = await request<GetProxyConfigsResponse>({
    method: 'GET',
    url: '/org/proxy_configs',
    headers: authHeaders,
  });

  return response.data;
};

const useProxyConfigs = () => {
  const { authHeaders, data: sessionData } = useSession();
  const isLive = sessionData?.org?.isLive;

  const proxyConfigsQuery = useQuery([QUERY_KEY, isLive], () =>
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
