import request from '@onefootprint/request';
import { GetSharingResponse } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';

import useSession, { AuthHeaders } from '@/domains/wallet/hooks/use-session';

const getSharing = async (authHeaders: AuthHeaders) => {
  const response = await request<GetSharingResponse>({
    method: 'GET',
    url: '/hosted/user/authorized_orgs',
    headers: authHeaders,
  });
  return response.data;
};

const useSharing = () => {
  const { authHeaders } = useSession();
  return useQuery(['user', 'sharing'], () => getSharing(authHeaders));
};

export default useSharing;
