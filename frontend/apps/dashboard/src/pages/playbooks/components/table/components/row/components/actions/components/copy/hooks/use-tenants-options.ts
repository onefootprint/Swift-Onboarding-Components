import request from '@onefootprint/request';
import type { GetAuthRoleResponse, GetAuthRolesRequest } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import { DASHBOARD_AUTHORIZATION_HEADER } from 'src/config/constants';
import useSession from 'src/hooks/use-session';

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

const useTenantsOptions = () => {
  const { dangerouslyCastedData } = useSession();
  const authToken = dangerouslyCastedData.auth;

  return useQuery({
    queryKey: ['tenantsOptions', authToken],
    queryFn: () => getAuthRoles({ authToken: dangerouslyCastedData.auth }),
    enabled: !!authToken,
    select: (res: GetAuthRoleResponse) =>
      res.map(tenant => ({
        label: tenant.name,
        value: tenant.id,
        meta: {
          isProdKycPlaybookRestricted: tenant.isProdKycPlaybookRestricted,
          isProdKybPlaybookRestricted: tenant.isProdKybPlaybookRestricted,
        },
      })),
  });
};

export default useTenantsOptions;
