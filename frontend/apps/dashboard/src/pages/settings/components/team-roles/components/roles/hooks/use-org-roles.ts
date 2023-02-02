import { useIntl } from '@onefootprint/hooks';
import request, {
  getErrorMessage,
  PaginatedRequestResponse,
} from '@onefootprint/request';
import {
  GetOrgRolesRequest,
  GetOrgRolesResponse,
  OrgRole,
} from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import usePagination from 'src/hooks/use-pagination';
import useSession, { AuthHeaders } from 'src/hooks/use-session';

import useOrgRolesFilters from './use-org-roles-filters';

const getOrgRolesRequest = async (
  authHeaders: AuthHeaders,
  params: GetOrgRolesRequest,
) => {
  const { data: response } = await request<
    PaginatedRequestResponse<GetOrgRolesResponse>
  >({
    method: 'GET',
    url: '/org/roles',
    headers: authHeaders,
    params,
  });

  return response;
};

const useOrgRoles = () => {
  const { authHeaders } = useSession();
  const { formatDateWithTime } = useIntl();
  const filters = useOrgRolesFilters();
  const { requestParams } = filters;
  const orgRolesQuery = useQuery(
    ['org', 'roles', requestParams],
    () => getOrgRolesRequest(authHeaders, requestParams),
    {
      enabled: filters.isReady,
      select: response => ({
        meta: response.meta,
        data: response.data.map((role: OrgRole) => ({
          ...role,
          createdAt: formatDateWithTime(new Date(role.createdAt)),
        })),
      }),
    },
  );
  const pagination = usePagination({
    count: orgRolesQuery.data?.meta.count,
    next: orgRolesQuery.data?.meta.nextPage,
    page: filters.values.page,
    onChange: newPage => filters.push({ roles_page: newPage }),
  });
  const errorMessage = orgRolesQuery.error
    ? getErrorMessage(orgRolesQuery.error)
    : undefined;

  return {
    ...orgRolesQuery,

    errorMessage,
    pagination,
  };
};

export default useOrgRoles;
