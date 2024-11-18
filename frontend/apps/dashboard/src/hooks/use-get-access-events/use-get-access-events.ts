import type { PaginatedRequestResponse } from '@onefootprint/request';
import request from '@onefootprint/request';
import type { AuditEvent } from '@onefootprint/request-types/dashboard';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

export type GetAccessEventsRequest = {
  cursor?: string;
  search?: string;
  targets?: string[];
  timestamp_gte?: string; // from
  timestamp_lte?: string; // to
  page_size?: number;
};

export type GetAccessEventsResponse = AuditEvent[];

import useSecurityLogsFilters from '../use-security-logs-filters';

const getAccessEventsRequest = async (params: GetAccessEventsRequest, authHeaders: AuthHeaders) => {
  const response = await request<PaginatedRequestResponse<GetAccessEventsResponse>>({
    headers: authHeaders,
    method: 'GET',
    params: {
      ...params,
      page_size: 100,
    },
    url: '/org/audit_events',
  });
  return response.data;
};

const useGetAccessEvents = () => {
  const { authHeaders } = useSession();
  const filters = useSecurityLogsFilters();

  return useInfiniteQuery({
    queryKey: ['accessEvents', filters.requestParams, authHeaders],
    queryFn: ({ pageParam }) => getAccessEventsRequest({ ...filters.requestParams, cursor: pageParam }, authHeaders),
    getNextPageParam: lastPage => lastPage.meta.next,
    initialPageParam: undefined as undefined | string,
    enabled: filters.isReady,
  });
};

export default useGetAccessEvents;
