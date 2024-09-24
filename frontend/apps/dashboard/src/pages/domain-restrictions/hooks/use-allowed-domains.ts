import request from '@onefootprint/request';
import type { GetClientSecurityResponse } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

const getAllowedDomains = async (authHeaders: AuthHeaders) => {
  const { data: response } = await request<GetClientSecurityResponse>({
    headers: authHeaders,
    method: 'GET',
    url: '/org/client_security_config',
  });

  return response;
};

const useAllowedDomains = () => {
  const { authHeaders, isLive } = useSession();
  return useQuery({
    queryKey: ['allowed-domains', isLive],
    queryFn: () => getAllowedDomains(authHeaders),
  });
};

export default useAllowedDomains;
