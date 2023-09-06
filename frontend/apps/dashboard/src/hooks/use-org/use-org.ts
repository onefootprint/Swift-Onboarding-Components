import request from '@onefootprint/request';
import type { GetOrgResponse } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';

import type { AuthHeaders } from '../use-session';
import useSession from '../use-session';

const getOrgRequest = async (authHeaders: AuthHeaders) => {
  const { data } = await request<GetOrgResponse>({
    method: 'GET',
    url: '/org',
    headers: authHeaders,
  });

  return data;
};

const useOrg = () => {
  const { authHeaders } = useSession();
  return useQuery(['org'], () => getOrgRequest(authHeaders));
};

export default useOrg;
