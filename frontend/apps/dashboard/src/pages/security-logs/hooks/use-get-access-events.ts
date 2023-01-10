import request, { PaginatedRequestResponse } from '@onefootprint/request';
import {
  GetAccessEventsRequest,
  GetAccessEventsResponse,
} from '@onefootprint/types';
import { useInfiniteQuery } from '@tanstack/react-query';
import useSession, { AuthHeaders } from 'src/hooks/use-session';
import { useDebounce } from 'usehooks-ts';

import useSecurityLogsFilters from './use-security-logs-filters';

const getAccessEventsRequest = async (
  params: GetAccessEventsRequest,
  authHeaders: AuthHeaders,
) => {
  const response = await request<
    PaginatedRequestResponse<GetAccessEventsResponse>
  >({
    headers: authHeaders,
    method: 'GET',
    params,
    url: '/org/access_events',
  });
  return response.data;
};

const useGetAccessEvents = () => {
  const { authHeaders } = useSession();
  const filters = useSecurityLogsFilters();
  const debouncedParams = useDebounce(filters.requestParams, 500);

  return useInfiniteQuery(
    ['accessEvents', debouncedParams, authHeaders],
    ({ pageParam }) =>
      getAccessEventsRequest(
        { ...debouncedParams, cursor: pageParam },
        authHeaders,
      ),
    {
      getNextPageParam: lastPage => lastPage.meta.next,
    },
  );
};

export default useGetAccessEvents;
