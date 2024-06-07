import request from '@onefootprint/request';
import type { GetOrgMetricsRequest, GetOrgMetricsResponse } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

import useFilters from '../use-filters';

const getOrgMetrics = async (authHeaders: AuthHeaders, params: GetOrgMetricsRequest) => {
  const { data: response } = await request<GetOrgMetricsResponse>({
    method: 'GET',
    url: `/org/metrics`,
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
      select: data => {
        const formattedMetrics = [];

        const passRateValue =
          data.successfulUserOnboardings === 0
            ? 0
            : (data.successfulUserOnboardings / (data.successfulUserOnboardings + data.failedUserOnboardings)) * 100;
        const passRate = passRateValue % 1 === 0 ? passRateValue : passRateValue.toFixed(1);

        formattedMetrics.push(
          {
            key: 'successfulUserOnboardings',
            value: data.successfulUserOnboardings,
          },
          {
            key: 'failedUserOnboardings',
            value: data.failedUserOnboardings,
          },
          {
            key: 'incompleteUserOnboardings',
            value: data.incompleteUserOnboardings,
          },
          { key: 'totalUserOnboardings', value: data.totalUserOnboardings },
          { key: 'passRate', value: `${passRate}%` },
          { key: 'newUserVaults', value: data.newUserVaults },
        );
        return formattedMetrics;
      },
    },
  );
};

export default useOrgMetrics;
