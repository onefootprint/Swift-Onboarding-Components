import request, {
  PaginatedRequestResponse,
  RequestError,
} from '@onefootprint/request';
import { ScopedUser } from '@onefootprint/types';
import {
  QueryFunctionContext,
  QueryKey,
  useQuery,
} from '@tanstack/react-query';
import omit from 'lodash/omit';
import useSessionUser, { AuthHeaders } from 'src/hooks/use-session-user';
import {
  getCursors,
  ScopedUsersListQuerystring,
  useFilters,
} from 'src/pages/users/hooks/use-filters';
import { dateRangeToFilterParams } from 'src/utils/date-range';

type ScopedUsersListQueryKey = [
  string,
  ScopedUsersListQuerystring,
  AuthHeaders,
  number,
];

type ScopedUsersListResponse = ScopedUser[];

const getScopedUsersRequest = async ({
  queryKey,
}: QueryFunctionContext<QueryKey, string>) => {
  const [, params, authHeaders, pageSize] = queryKey as ScopedUsersListQueryKey;
  const dateRangeFilters = dateRangeToFilterParams(params);
  // cursors is a stack of cursors for all pages visited. Use the cursor on the top of the stack
  // (the current page) when asking the backend for results
  const cursors = getCursors(params);
  const req = {
    ...omit(params, 'cursors', 'dateRange'),
    ...dateRangeFilters,
    cursor: cursors[cursors.length - 1],
    pageSize,
  };
  const response = await request<
    PaginatedRequestResponse<ScopedUsersListResponse>
  >({
    method: 'GET',
    url: '/users',
    params: req,
    headers: authHeaders,
  });
  return response.data;
};

const useGetScopedUsers = (pageSize: number) => {
  const { authHeaders } = useSessionUser();
  const { filters } = useFilters();

  const query: Record<string, any> = {};
  if (filters.footprint_user_id) {
    query.footprint_user_id = filters.footprint_user_id;
  }

  return useQuery<
    PaginatedRequestResponse<ScopedUsersListResponse>,
    RequestError
  >(
    ['paginatedScopedUsers', query, authHeaders, pageSize],
    getScopedUsersRequest,
    {
      retry: false,
    },
  );
};

export default useGetScopedUsers;
