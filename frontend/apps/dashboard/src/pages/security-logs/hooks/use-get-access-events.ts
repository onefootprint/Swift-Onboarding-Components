import { QueryFunctionContext, QueryKey, useInfiniteQuery } from 'react-query';
import request, { RequestError, RequestResponse } from 'request';
import useSessionUser from 'src/hooks/use-session-user';
import { useFilters } from 'src/pages/users/hooks/use-filters';
import { AccessEvent } from 'src/types';

import { DASHBOARD_AUTHORIZATION_HEADER } from '../../../config/constants';

type AccessEventsRequest = {};

type AccessEventsResponse = {
  data: AccessEvent[];
  next?: string;
};

type AccessEventQueryKey = [string, AccessEventsRequest, string];

const getAccessEventsRequest = async ({
  queryKey,
  pageParam,
}: QueryFunctionContext<QueryKey, string>) => {
  const [, query, auth] = queryKey as AccessEventQueryKey;
  // Join filter request args with the pageParam
  const params = {
    ...query,
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

  const { query } = useFilters();
  return useInfiniteQuery<AccessEventsResponse, RequestError>(
    ['paginatedAccessEvents', query, auth] as AccessEventQueryKey,
    getAccessEventsRequest,
    {
      retry: false,
      getNextPageParam: lastPage => lastPage.next,
    },
  );
};

export default useGetAccessEvents;
