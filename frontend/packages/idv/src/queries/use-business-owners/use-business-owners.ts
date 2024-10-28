import request from '@onefootprint/request';
import type { GetHostedBusinessOwnersResponse } from '@onefootprint/request-types';
import { AUTH_HEADER } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';

const getBusinessOwnersRequest = async ({ authToken }: { authToken: string }) => {
  const { data } = await request<GetHostedBusinessOwnersResponse>({
    method: 'GET',
    url: '/hosted/business/owners',
    headers: { [AUTH_HEADER]: authToken },
  });

  return data;
};

const useBusinessOwners = ({ authToken }: { authToken: string }) => {
  return useQuery({
    queryKey: ['business-owners', authToken],
    queryFn: () => getBusinessOwnersRequest({ authToken }),
    enabled: !!authToken,
  });
};

export default useBusinessOwners;
