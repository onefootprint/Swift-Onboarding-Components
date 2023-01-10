import request from '@onefootprint/request';
import { GetAuthRoleResponse, GetAuthRolesRequest } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import { DASHBOARD_AUTHORIZATION_HEADER } from 'src/config/constants';

const getRolesRequest = async ({ authToken }: GetAuthRolesRequest) => {
  const { data } = await request<GetAuthRoleResponse>({
    method: 'GET',
    url: '/org/auth/roles',
    headers: {
      [DASHBOARD_AUTHORIZATION_HEADER]: authToken,
    },
  });

  return data;
};

const useGetRoles = (authToken: string) =>
  useQuery(['get-roles', authToken], () => getRolesRequest({ authToken }), {
    enabled: !!authToken,
  });

export default useGetRoles;
