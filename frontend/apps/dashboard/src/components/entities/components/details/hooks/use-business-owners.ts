import request from '@onefootprint/request';
import type { GetBusinessOwnersRequest, GetBusinessOwnersResponse } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

const getBusinessOwners = async (authHeaders: AuthHeaders, { id }: GetBusinessOwnersRequest) => {
  const response = await request<GetBusinessOwnersResponse>({
    method: 'GET',
    url: `/entities/${id}/business_owners`,
    headers: authHeaders,
  });

  return response.data;
};

const useBusinessOwners = (id: string) => {
  const { authHeaders } = useSession();

  return useQuery(['business', id, 'owners'], () => getBusinessOwners(authHeaders, { id }), {
    enabled: !!id,
  });
};

export default useBusinessOwners;
