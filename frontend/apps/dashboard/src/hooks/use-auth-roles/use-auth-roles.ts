import request from '@onefootprint/request';
import type { GetAuthRoleResponse, GetAuthRolesRequest } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import { DASHBOARD_AUTHORIZATION_HEADER } from 'src/config/constants';

const getAuthRoles = async ({ authToken }: GetAuthRolesRequest) => {
  const { data } = await request<GetAuthRoleResponse>({
    method: 'GET',
    url: '/org/auth/roles',
    headers: {
      [DASHBOARD_AUTHORIZATION_HEADER]: authToken,
    },
  });

  return data;
};

const useAuthRoles = (authToken: string) =>
  useQuery({
    queryKey: ['get-roles', authToken],
    queryFn: () => getAuthRoles({ authToken }),
    enabled: !!authToken,
  });

export default useAuthRoles;
