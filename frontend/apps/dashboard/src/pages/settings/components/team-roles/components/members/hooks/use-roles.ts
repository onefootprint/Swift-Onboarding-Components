import request, {
  getErrorMessage,
  PaginatedRequestResponse,
} from '@onefootprint/request';
import { GetOrgRolesResponse } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import useSession, { AuthHeaders } from 'src/hooks/use-session';

const getRolesRequest = async (authHeaders: AuthHeaders) => {
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

  return response.data;
};

const useRoles = () => {
  const { authHeaders } = useSession();
  const rolesQuery = useQuery(['members', 'roles'], () =>
    getRolesRequest(authHeaders),
  );
  const { error, data = [] } = rolesQuery;
  const options = data.map(role => ({ label: role.name, value: role.id }));
  return {
    ...rolesQuery,
    errorMessage: error ? getErrorMessage(error) : undefined,
    options,
  };
};

export default useRoles;
