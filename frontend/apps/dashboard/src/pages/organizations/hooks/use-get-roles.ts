import request, { RequestError } from '@onefootprint/request';
import { GetAuthRolesRequest, Organization } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';

import { DASHBOARD_AUTHORIZATION_HEADER } from '../../../config/constants';

const getRolesRequest = async ({ authToken }: GetAuthRolesRequest) => {
  const { data } = await request<Organization[]>({
    method: 'GET',
    url: '/org/auth/roles',
    headers: {
      [DASHBOARD_AUTHORIZATION_HEADER]: authToken,
    },
  });

  return data;
};

const useGetRoles = (authToken: string) =>
  useQuery<Organization[], RequestError>(
    ['get-roles', authToken],
    () => getRolesRequest({ authToken }),
    {
      enabled: !!authToken,
    },
  );

export default useGetRoles;
