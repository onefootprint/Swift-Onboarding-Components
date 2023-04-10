import request from '@onefootprint/request';
import {
  GetBusinessOwnersRequest,
  GetBusinessOwnersResponse,
} from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import useSession, { AuthHeaders } from 'src/hooks/use-session';

const getBusinessOwners = async (
  authHeaders: AuthHeaders,
  { id }: GetBusinessOwnersRequest,
) => {
  const response = await request<GetBusinessOwnersResponse>({
    method: 'GET',
    url: `/businesses/${id}/owners`,
    headers: authHeaders,
  });

  return response.data;
};

const useBusinessOwners = (id: string) => {
  const { authHeaders } = useSession();

  return useQuery(
    ['business', id, 'owners'],
    () => getBusinessOwners(authHeaders, { id }),
    {
      enabled: !!id,
    },
  );
};

export default useBusinessOwners;
