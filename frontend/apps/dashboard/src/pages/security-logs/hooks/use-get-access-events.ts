import type { PaginatedRequestResponse } from '@onefootprint/request';
import request from '@onefootprint/request';
import type { GetAccessEventsRequest, GetAccessEventsResponse } from '@onefootprint/types';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

import useSecurityLogsFilters from './use-security-logs-filters';

const getAccessEventsRequest = async (params: GetAccessEventsRequest, authHeaders: AuthHeaders) => {
  const response = await request<PaginatedRequestResponse<GetAccessEventsResponse>>({
    headers: authHeaders,
    method: 'GET',
    params,
    url: '/org/audit_events',
  });
  return response.data;
};

const useGetAccessEvents = () => {
  const { authHeaders } = useSession();
  const filters = useSecurityLogsFilters();

  return useInfiniteQuery(
    ['accessEvents', filters.requestParams, authHeaders],
    ({ pageParam }) => getAccessEventsRequest({ ...filters.requestParams, cursor: pageParam }, authHeaders),
    {
      getNextPageParam: lastPage => lastPage.meta.next,
      enabled: filters.isReady,
    },
  );
};

export default useGetAccessEvents;
