import type { PaginatedRequestResponse } from '@onefootprint/request';
import request from '@onefootprint/request';
import type { GetPlaybooksResponse } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

const getPlaybooks = async (authHeaders: AuthHeaders) => {
  const { data: response } = await request<PaginatedRequestResponse<GetPlaybooksResponse>>({
    method: 'GET',
    url: '/org/playbooks',
    headers: authHeaders,
  });

  return response.data;
};

const usePlaybooks = () => {
  const { authHeaders } = useSession();
  return useQuery({
    queryKey: ['entities', 'onboarding-configurations', authHeaders],
    queryFn: () => getPlaybooks(authHeaders),
  });
};

export default usePlaybooks;
