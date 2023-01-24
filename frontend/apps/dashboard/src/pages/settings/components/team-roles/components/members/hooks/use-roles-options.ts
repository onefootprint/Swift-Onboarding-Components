import request, {
  getErrorMessage,
  PaginatedRequestResponse,
} from '@onefootprint/request';
import { GetOrgRolesResponse } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import useSession, { AuthHeaders } from 'src/hooks/use-session';

const getOrgRolesRequest = async (authHeaders: AuthHeaders) => {
  const { data: response } = await request<
    PaginatedRequestResponse<GetOrgRolesResponse>
  >({
    method: 'GET',
    url: '/org/roles',
    headers: authHeaders,
    params: {
      // we don't want pagination here
      pageSize: 100,
    },
  });

  return response;
};

const useRolesOptions = () => {
  const { authHeaders } = useSession();
  const rolesQuery = useQuery(
    ['members', 'roles'],
    () => getOrgRolesRequest(authHeaders),
    {
      select: response =>
        response.data.map(role => ({ label: role.name, value: role.id })),
    },
  );
  const { error } = rolesQuery;
  return {
    ...rolesQuery,
    errorMessage: error ? getErrorMessage(error) : undefined,
  };
};

export default useRolesOptions;
