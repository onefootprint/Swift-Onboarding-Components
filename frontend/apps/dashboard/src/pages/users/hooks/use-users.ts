import request, { PaginatedRequestResponse } from '@onefootprint/request';
import {
  getOnboardingCanAccessAttributes,
  Onboarding,
  requiresManualReview,
  ScopedUser,
  statusForScopedUser,
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
  const reqParams = {
    kind: 'person',
    ...params,
  };
  const { data: response } = await request<
    PaginatedRequestResponse<UsersResponse>
  >({
    method: 'GET',
    url: '/users',
    headers: authHeaders,
    params: reqParams,
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
      select: (response: PaginatedRequestResponse<UsersResponse>) => {
        const getOnboarding = (onboarding?: Onboarding) => {
          if (!onboarding) {
            return undefined;
          }
          return {
            ...onboarding,
            canAccessAttributes: getOnboardingCanAccessAttributes(onboarding),
          };
        };
        return {
          meta: response.meta,
          data: response.data.map((scopedUser: ScopedUser) => ({
            ...scopedUser,
            requiresManualReview: requiresManualReview(scopedUser),
            status: statusForScopedUser(scopedUser),
            onboarding: getOnboarding(scopedUser.onboarding),
          })),
        };
      },
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
