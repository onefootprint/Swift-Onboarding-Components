import { QueryFunctionContext, QueryKey, useInfiniteQuery } from 'react-query';
import request, { RequestError, RequestResponse } from 'request';
import useSessionUser from 'src/hooks/use-session-user';
import {
  AccessEventFilters,
  getDateRange,
  useFilters,
} from 'src/pages/security-logs/hooks/use-filters';
import { AccessEvent, dateRangeToFilterParams } from 'src/types';
import { useDebounce } from 'usehooks-ts';

import { DASHBOARD_AUTHORIZATION_HEADER } from '../../../config/constants';

type AccessEventsResponse = {
  data: AccessEvent[];
  next?: string;
};

type AccessEventQueryKey = [string, AccessEventFilters, string];

const getAccessEventsRequest = async ({
  queryKey,
  pageParam,
}: QueryFunctionContext<QueryKey, string>) => {
  const [, filters, auth] = queryKey as AccessEventQueryKey;
  const dateRangeFilters = dateRangeToFilterParams(getDateRange(filters));
  // Join filter request args with the pageParam
  const params = {
    ...filters,
    ...dateRangeFilters,
    cursor: pageParam,
  };
  const { data: response } = await request<RequestResponse<AccessEvent[]>>({
    method: 'GET',
    url: '/org/access_events',
    params,
    headers: { [DASHBOARD_AUTHORIZATION_HEADER]: auth as string },
  });
  return response;
};

const useGetAccessEvents = () => {
  const session = useSessionUser();
  const auth = session.data?.auth;
  const { filters } = useFilters();

  const debouncedFilters = useDebounce(filters, 500);

  return useInfiniteQuery<AccessEventsResponse, RequestError>(
    ['paginatedAccessEvents', debouncedFilters, auth] as AccessEventQueryKey,
    getAccessEventsRequest,
    {
      retry: false,
      getNextPageParam: lastPage => lastPage.next,
    },
  );
};

export default useGetAccessEvents;
