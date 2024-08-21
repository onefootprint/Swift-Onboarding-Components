import request from '@onefootprint/request';
import type { GetOrgMetricsRequest, GetOrgMetricsResponse } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

import useFilters from '../use-filters';

const getOrgMetrics = async (authHeaders: AuthHeaders, params: GetOrgMetricsRequest) => {
  const { data: response } = await request<GetOrgMetricsResponse>({
    method: 'GET',
    url: '/org/metrics',
    headers: authHeaders,
    params,
  });
  return response;
};

const useOrgMetrics = () => {
  const { authHeaders } = useSession();
  const { requestParams, isReady } = useFilters();

  return useQuery(
    ['org', 'metrics', requestParams, authHeaders],
    () => getOrgMetrics(authHeaders, { ...requestParams }),
    {
      enabled: isReady,
    },
  );
};

export default useOrgMetrics;
