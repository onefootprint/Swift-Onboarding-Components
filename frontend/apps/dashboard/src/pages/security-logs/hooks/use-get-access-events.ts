import request, {
  PaginatedRequestResponse,
  RequestError,
} from '@onefootprint/request';
import { AccessEvent } from '@onefootprint/types';
import {
  QueryFunctionContext,
  QueryKey,
  useInfiniteQuery,
} from '@tanstack/react-query';
import useSessionUser, { AuthHeaders } from 'src/hooks/use-session-user';
import {
  AccessEventFilters,
  useFilters,
} from 'src/pages/security-logs/hooks/use-filters';
import { dateRangeToFilterParams } from 'src/utils/date-range';
import { useDebounce } from 'usehooks-ts';

type AccessEventsResponse = AccessEvent[];

type AccessEventQueryKey = [string, AccessEventFilters, AuthHeaders];

const getAccessEventsRequest = async ({
  queryKey,
  pageParam,
}: QueryFunctionContext<QueryKey, string>) => {
  const [, filters, authHeaders] = queryKey as AccessEventQueryKey;
  const dateRangeFilters = dateRangeToFilterParams(filters);
  // Map the selected data kinds to the targets expected by the backend
  const targets = filters.dataKinds?.split(',').map(kind => `identity.${kind}`);
  // Join filter request args with the pageParam
  const params = {
    ...filters,
    ...dateRangeFilters,
    targets,
    kind: 'decrypt',
    cursor: pageParam,
  };
  const response = await request<
    PaginatedRequestResponse<AccessEventsResponse>
  >({
    method: 'GET',
    url: '/org/access_events',
    params,
    headers: authHeaders,
  });
  return response.data;
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
