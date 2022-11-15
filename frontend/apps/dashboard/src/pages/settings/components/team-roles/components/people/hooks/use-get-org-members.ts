import { useIntl } from '@onefootprint/hooks';
import request, { PaginatedRequestResponse } from '@onefootprint/request';
import { GetOrgMembersResponse, OrgMember } from '@onefootprint/types';
import {
  QueryFunctionContext,
  QueryKey,
  useQuery,
} from '@tanstack/react-query';
import omit from 'lodash/omit';
import useSessionUser, { AuthHeaders } from 'src/hooks/use-session-user';
import { dateRangeToFilterParams } from 'src/utils/date-range';

import useOrgMembersFilters, {
  getCursors,
  OrgMembersQueryString,
} from './use-org-members-filters';

type OrgMembersQueryKey = [string, OrgMembersQueryString, AuthHeaders, number];

const getOrgMembersRequest = async ({
  queryKey,
}: QueryFunctionContext<QueryKey, string>) => {
  const [, params, authHeaders, pageSize] = queryKey as OrgMembersQueryKey;
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
    PaginatedRequestResponse<GetOrgMembersResponse>
  >({
    method: 'GET',
    url: '/org/members',
    params: req,
    headers: authHeaders,
  });
  return response.data;
};

const useGetOrgMembers = (pageSize: number) => {
  const { authHeaders } = useSessionUser();
  const { formatRelativeDate } = useIntl();
  const { filters } = useOrgMembersFilters();

  const query: Record<string, any> = {};
  if (filters.roles) {
    query.roles = filters.roles;
  }
  if (filters.emails) {
    query.emails = filters.emails;
  }
  if (filters.dateRange) {
    query.dateRange = filters.dateRange;
  }

  return useQuery(
    ['paginatedOrgMembers', query, authHeaders, pageSize] as OrgMembersQueryKey,
    getOrgMembersRequest,
    {
      retry: false,
      select: response => ({
        ...response,
        data: response.data.map((member: OrgMember) => ({
          ...member,
          lastLoginAt: member.lastLoginAt
            ? formatRelativeDate(new Date(member.lastLoginAt))
            : null,
        })),
      }),
    },
  );
};

export default useGetOrgMembers;
