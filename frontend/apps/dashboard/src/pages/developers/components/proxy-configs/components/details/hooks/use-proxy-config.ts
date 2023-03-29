import request, { getErrorMessage } from '@onefootprint/request';
import { GetProxyConfigResponse } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import useSession, { AuthHeaders } from 'src/hooks/use-session';

import { DETAILS_QUERY_KEY } from '@/proxy-configs/constants';

const getProxyConfig = async (authHeaders: AuthHeaders, id: string) => {
  const response = await request<GetProxyConfigResponse>({
    method: 'GET',
    url: `/org/proxy_configs/${id}`,
    headers: authHeaders,
  });

  return response.data;
};

const useProxyConfig = (id: string = '') => {
  const { authHeaders } = useSession();
  const proxyConfigQuery = useQuery(
    [...DETAILS_QUERY_KEY, id],
    () => getProxyConfig(authHeaders, id),
    {
      enabled: !!id,
    },
  );
  const { error, data } = proxyConfigQuery;
  return {
    ...proxyConfigQuery,
    errorMessage: error ? getErrorMessage(error) : undefined,
    data,
  };
};

export default useProxyConfig;
