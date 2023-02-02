import request, { PaginatedRequestResponse } from '@onefootprint/request';
import {
  OnboardingStatus,
  ScopedUser,
  UsersRequest,
  UsersResponse,
} from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import { useCursorPagination } from 'src/hooks/use-pagination';
import useSession, { AuthHeaders } from 'src/hooks/use-session';

import useUsersFilters from './use-users-filters';

const getUsersRequest = async (
  authHeaders: AuthHeaders,
  params: UsersRequest,
) => {
  const { data: response } = await request<
    PaginatedRequestResponse<UsersResponse>
  >({
    method: 'GET',
    url: '/users',
    headers: authHeaders,
    params,
  });

  return response;
};

const useUsers = () => {
  const { authHeaders } = useSession();
  const filters = useUsersFilters();
  const { requestParams } = filters;
  const usersQuery = useQuery(
    ['users', authHeaders, requestParams],
    () => getUsersRequest(authHeaders, requestParams),
    {
      enabled: filters.isReady,
      select: (response: PaginatedRequestResponse<UsersResponse>) => ({
        meta: response.meta,
        data: response.data.map((metadata: ScopedUser) => ({
          ...metadata,
          requiresManualReview:
            metadata.onboarding?.requiresManualReview || false,
          status: metadata.onboarding?.status || OnboardingStatus.vaultOnly,
        })),
      }),
    },
  );
  const pagination = useCursorPagination({
    count: usersQuery.data?.meta.count,
    next: usersQuery.data?.meta.next,
    cursor: filters.values.cursor,
    onChange: newCursor => filters.push({ cursor: newCursor }),
  });

  return {
    ...usersQuery,
    pagination,
  };
};

export default useUsers;
