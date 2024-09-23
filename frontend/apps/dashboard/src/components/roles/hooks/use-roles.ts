import { useIntl } from '@onefootprint/hooks';
import type { PaginatedRequestResponse } from '@onefootprint/request';
import request, { getErrorMessage } from '@onefootprint/request';
import type { GetRolesRequest, GetRolesResponse, Role, RoleKind } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import usePagination from 'src/hooks/use-pagination';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

import useRolesFilters from './use-roles-filters';

const getRoles = async (authHeaders: AuthHeaders, params: GetRolesRequest) => {
  const { data: response } = await request<PaginatedRequestResponse<GetRolesResponse>>({
    method: 'GET',
    url: '/org/roles',
    headers: authHeaders,
    params,
  });

  return response;
};

const useRoles = (kind: RoleKind) => {
  const { authHeaders } = useSession();
  const { formatDateWithTime } = useIntl();
  const filters = useRolesFilters();
  const { requestParams } = filters;
  const allReqParams = { ...requestParams, kind };
  const rolesQuery = useQuery({
    queryKey: ['org', 'roles', allReqParams, authHeaders],
    queryFn: () => getRoles(authHeaders, allReqParams),
    enabled: filters.isReady,
    select: response => ({
      meta: response.meta,
      data: response.data.map((role: Role) => ({
        ...role,
        createdAt: formatDateWithTime(new Date(role.createdAt)),
      })),
    }),
  });
  const pagination = usePagination({
    count: rolesQuery.data?.meta.count,
    next: rolesQuery.data?.meta.nextPage,
    onChange: newPage => filters.push({ roles_page: newPage }),
    page: filters.values.page,
    pageSize: 10,
  });
  const errorMessage = rolesQuery.error ? getErrorMessage(rolesQuery.error) : undefined;

  return {
    ...rolesQuery,
    errorMessage,
    pagination,
  };
};

export default useRoles;
