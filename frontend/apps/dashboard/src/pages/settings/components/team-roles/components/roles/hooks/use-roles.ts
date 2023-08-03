import { useIntl } from '@onefootprint/hooks';
import request, {
  getErrorMessage,
  PaginatedRequestResponse,
} from '@onefootprint/request';
import { GetRolesRequest, GetRolesResponse, Role } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import usePagination from 'src/hooks/use-pagination';
import useSession, { AuthHeaders } from 'src/hooks/use-session';

import useRolesFilters from './use-roles-filters';

const getRoles = async (authHeaders: AuthHeaders, params: GetRolesRequest) => {
  const { data: response } = await request<
    PaginatedRequestResponse<GetRolesResponse>
  >({
    method: 'GET',
    url: '/org/roles',
    headers: authHeaders,
    params,
  });

  return response;
};

const useRoles = () => {
  const { authHeaders } = useSession();
  const { formatDateWithTime } = useIntl();
  const filters = useRolesFilters();
  const { requestParams } = filters;
  const rolesQuery = useQuery(
    ['org', 'roles', requestParams],
    () => getRoles(authHeaders, requestParams),
    {
      enabled: filters.isReady,
      select: response => ({
        meta: response.meta,
        data: response.data.map((role: Role) => ({
          ...role,
          createdAt: formatDateWithTime(new Date(role.createdAt)),
        })),
      }),
    },
  );
  const pagination = usePagination({
    count: rolesQuery.data?.meta.count,
    next: rolesQuery.data?.meta.nextPage,
    page: filters.values.page,
    onChange: newPage => filters.push({ roles_page: newPage }),
  });
  const errorMessage = rolesQuery.error
    ? getErrorMessage(rolesQuery.error)
    : undefined;

  return {
    ...rolesQuery,
    errorMessage,
    pagination,
  };
};

export default useRoles;
