import type { PaginatedRequestResponse } from '@onefootprint/request';
import request, { getErrorMessage } from '@onefootprint/request';
import type { GetRolesResponse, RoleKind } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

const getRolesRequest = async (authHeaders: AuthHeaders, kind: RoleKind) => {
  const { data: response } = await request<PaginatedRequestResponse<GetRolesResponse>>({
    method: 'GET',
    url: '/org/roles',
    headers: authHeaders,
    params: {
      // we don't want pagination here
      kind,
      pageSize: 100,
    },
  });

  return response.data;
};

const useRoles = (kind: RoleKind) => {
  const { authHeaders } = useSession();
  const rolesQuery = useQuery({
    queryKey: ['members', 'roles', kind, authHeaders],
    queryFn: () => getRolesRequest(authHeaders, kind),
  });
  const { error, data = [] } = rolesQuery;
  const options = data.map(role => ({ label: role.name, value: role.id }));
  return {
    ...rolesQuery,
    errorMessage: error ? getErrorMessage(error) : undefined,
    options,
  };
};

export default useRoles;
