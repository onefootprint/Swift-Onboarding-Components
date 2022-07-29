import {
  QueryFunctionContext,
  QueryKey,
  useQuery,
} from '@tanstack/react-query';
import { omit } from 'lodash';
import request, { RequestError, RequestResponse } from 'request';
import useSessionUser, { AuthHeaders } from 'src/hooks/use-session-user';
import {
  getCursors,
  ScopedUsersListQuerystring,
  useFilters,
} from 'src/pages/users/hooks/use-filters';
import { dateRangeToFilterParams, ScopedUser } from 'src/types';

type ScopedUsersListQueryKey = [
  string,
  ScopedUsersListQuerystring,
  AuthHeaders,
  number,
];

type ScopedUsersListResponse = {
  data: ScopedUser[];
  next?: string;
  count?: number;
};

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
  const { data: response } = await request<RequestResponse<ScopedUser[]>>({
    method: 'GET',
    url: '/org/scoped_users',
    params: req,
    headers: authHeaders,
  });
  return response;
};

const useGetScopedUsers = (pageSize: number) => {
  const { authHeaders } = useSessionUser();
  const { filters } = useFilters();

  return useQuery<ScopedUsersListResponse, RequestError>(
    ['paginatedScopedUsers', filters, authHeaders, pageSize],
    getScopedUsersRequest,
    {
      retry: false,
    },
  );
};

export default useGetScopedUsers;
