import request, { RequestError } from '@onefootprint/request';
import { Organization } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';

import { DASHBOARD_AUTHORIZATION_HEADER } from '../../../config/constants';

type GetRolesRequest = {
  authToken: string;
};

const getRolesRequest = async ({ authToken }: GetRolesRequest) => {
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
  useQuery<Organization[], RequestError>(['get-roles', authToken], () =>
    getRolesRequest({ authToken }),
  );

export default useGetRoles;
