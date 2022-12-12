import { useIntl } from '@onefootprint/hooks';
import request, { PaginatedRequestResponse } from '@onefootprint/request';
import { GetOrgRolesResponse, OrgRole } from '@onefootprint/types';
import {
  QueryFunctionContext,
  QueryKey,
  useQuery,
} from '@tanstack/react-query';
import omit from 'lodash/omit';
import useSession, { AuthHeaders } from 'src/hooks/use-session';
import { dateRangeToFilterParams } from 'src/utils/date-range';

import useOrgRolesFilters, {
  getCursors,
  OrgRolesQueryString,
} from './use-org-roles-filters';

type OrgRolesQueryKey = [string, OrgRolesQueryString, AuthHeaders, number];

const getOrgRolesRequest = async ({
  queryKey,
}: QueryFunctionContext<QueryKey, string>) => {
  const [, params, authHeaders, pageSize] = queryKey as OrgRolesQueryKey;
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
  const response = await request<PaginatedRequestResponse<GetOrgRolesResponse>>(
    {
      method: 'GET',
      url: '/org/roles',
      params: req,
      headers: authHeaders,
    },
  );
  return response.data;
};

const useGetOrgRoles = (pageSize: number) => {
  const { authHeaders } = useSession();
  const { formatDateWithTime } = useIntl();
  const { filters } = useOrgRolesFilters();

  const query: Record<string, any> = {};
  if (filters.roles) {
    query.roles = filters.roles;
  }
  if (filters.permissions) {
    query.permissions = filters.permissions;
  }
  if (filters.dateRange) {
    query.dateRange = filters.dateRange;
  }

  return useQuery(
    ['paginatedOrgRoles', query, authHeaders, pageSize] as OrgRolesQueryKey,
    getOrgRolesRequest,
    {
      retry: false,
      select: response => ({
        ...response,
        data: response.data.map((role: OrgRole) => ({
          ...role,
          createdAt: formatDateWithTime(new Date(role.createdAt)),
        })),
      }),
    },
  );
};

export default useGetOrgRoles;
