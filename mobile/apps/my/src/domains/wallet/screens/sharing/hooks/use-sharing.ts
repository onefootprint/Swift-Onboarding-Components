import request from '@onefootprint/request';
import { GetSharingResponse } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';

import AUTH_HEADER from '@/config/constants';
import useSession from '@/domains/wallet/hooks/use-session';

const getSharing = async (authToken: string) => {
  const response = await request<GetSharingResponse>({
    method: 'GET',
    url: '/hosted/user/authorized_orgs',
    headers: {
      [AUTH_HEADER]: authToken,
    },
  });
  return response.data;
};

const useSharing = () => {
  const { data } = useSession();
  return useQuery(['user', 'sharing'], () => getSharing(data.authToken));
};

export default useSharing;
