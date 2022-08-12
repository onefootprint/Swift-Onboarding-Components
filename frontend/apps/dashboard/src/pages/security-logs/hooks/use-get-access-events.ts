import {
  QueryFunctionContext,
  QueryKey,
  useInfiniteQuery,
} from '@tanstack/react-query';
import request, { PaginatedRequestResponse, RequestError } from 'request';
import useSessionUser, { AuthHeaders } from 'src/hooks/use-session-user';
import {
  AccessEventFilters,
  useFilters,
} from 'src/pages/security-logs/hooks/use-filters';
import { AccessEvent, dateRangeToFilterParams } from 'src/types';
import { useDebounce } from 'usehooks-ts';

type AccessEventsResponse = AccessEvent[];

type AccessEventQueryKey = [string, AccessEventFilters, AuthHeaders];

const getAccessEventsRequest = async ({
  queryKey,
  pageParam,
}: QueryFunctionContext<QueryKey, string>) => {
  const [, filters, authHeaders] = queryKey as AccessEventQueryKey;
  const dateRangeFilters = dateRangeToFilterParams(filters);
  // Join filter request args with the pageParam
  const params = {
    ...filters,
    ...dateRangeFilters,
    cursor: pageParam,
  };
  const { data: response } = await request<
    PaginatedRequestResponse<AccessEventsResponse>
  >({
    method: 'GET',
    url: '/users/access_events',
    params,
    headers: authHeaders,
  });
  return response;
};

const useGetAccessEvents = () => {
  const { authHeaders } = useSessionUser();
  const { filters } = useFilters();

  const debouncedFilters = useDebounce(filters, 500);

  return useInfiniteQuery<
    PaginatedRequestResponse<AccessEventsResponse>,
    RequestError
  >(
    [
      'paginatedAccessEvents',
      debouncedFilters,
      authHeaders,
    ] as AccessEventQueryKey,
    getAccessEventsRequest,
    {
      retry: false,
      getNextPageParam: lastPage => lastPage.meta.next,
    },
  );
};

export default useGetAccessEvents;
