import { useIntl } from '@onefootprint/hooks';
import type { PaginatedRequestResponse } from '@onefootprint/request';
import request, { getErrorMessage } from '@onefootprint/request';
import type { GetMembersRequest, GetMembersResponse, Member } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import usePagination from 'src/hooks/use-pagination';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

import useMembersFilters from './use-members-filters';

const getMembers = async (authHeaders: AuthHeaders, params: GetMembersRequest) => {
  const { data: response } = await request<PaginatedRequestResponse<GetMembersResponse>>({
    method: 'GET',
    url: '/org/members',
    headers: authHeaders,
    params,
  });

  return response;
};

const useMembers = () => {
  const { authHeaders } = useSession();
  const { formatRelativeDate } = useIntl();
  const filters = useMembersFilters();
  const { requestParams } = filters;
  const membersQuery = useQuery(['org', 'members', requestParams], () => getMembers(authHeaders, requestParams), {
    enabled: filters.isReady,
    select: response => ({
      meta: response.meta,
      data: response.data.map((member: Member) => ({
        ...member,
        rolebinding: {
          lastLoginAt: member.rolebinding?.lastLoginAt
            ? formatRelativeDate(new Date(member.rolebinding?.lastLoginAt))
            : null,
        },
      })),
    }),
  });
  const pagination = usePagination({
    count: membersQuery.data?.meta.count,
    next: membersQuery.data?.meta.nextPage,
    onChange: newPage => filters.push({ members_page: newPage }),
    page: filters.values.page,
    pageSize: 10,
  });
  const errorMessage = membersQuery.error ? getErrorMessage(membersQuery.error) : undefined;

  return {
    ...membersQuery,
    errorMessage,
    pagination,
  };
};

export default useMembers;
