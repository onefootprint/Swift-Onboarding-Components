import { useIntl } from '@onefootprint/hooks';
import request, {
  getErrorMessage,
  PaginatedRequestResponse,
} from '@onefootprint/request';
import {
  GetOrgMembersRequest,
  GetOrgMembersResponse,
  OrgMember,
} from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import usePagination from 'src/hooks/use-pagination';
import useSession, { AuthHeaders } from 'src/hooks/use-session';

import useOrgMembersFilters from './use-org-members-filters';

const getOrgMembersRequest = async (
  authHeaders: AuthHeaders,
  params: GetOrgMembersRequest,
) => {
  const { data: response } = await request<
    PaginatedRequestResponse<GetOrgMembersResponse>
  >({
    method: 'GET',
    url: '/org/members',
    headers: authHeaders,
    params,
  });

  return response;
};

const useOrgMembers = () => {
  const { authHeaders } = useSession();
  const { formatRelativeDate } = useIntl();
  const filters = useOrgMembersFilters();
  const { requestParams } = filters;
  const orgMembersQuery = useQuery(
    ['org', 'members', requestParams],
    () => getOrgMembersRequest(authHeaders, requestParams),
    {
      enabled: filters.isReady,
      select: response => ({
        meta: response.meta,
        data: response.data.map((member: OrgMember) => ({
          ...member,
          lastLoginAt: member.lastLoginAt
            ? formatRelativeDate(new Date(member.lastLoginAt))
            : null,
        })),
      }),
    },
  );
  const pagination = usePagination({
    count: orgMembersQuery.data?.meta.count,
    next: orgMembersQuery.data?.meta.nextPage,
    page: filters.values.page,
    onChange: newPage => filters.push({ members_page: newPage }),
  });
  const errorMessage = orgMembersQuery.error
    ? getErrorMessage(orgMembersQuery.error)
    : undefined;

  return {
    ...orgMembersQuery,
    errorMessage,
    pagination,
  };
};

export default useOrgMembers;
