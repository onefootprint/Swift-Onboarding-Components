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

  // TODO: Remove this once backend is ready
  const randomFirstNames = ['John', 'Jane', 'Michael', 'Emily', 'David', 'Sarah'];
  const lastNameLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  return response.data.map(owner => ({
    id: owner.id ?? `owner-${Math.random().toString(36).substr(2, 9)}`,
    firstName: randomFirstNames[Math.floor(Math.random() * randomFirstNames.length)],
    lastName: `${lastNameLetters[Math.floor(Math.random() * lastNameLetters.length)]}${'*'.repeat(Math.floor(Math.random() * 4) + 2)}`,
  }));
};

const useBusinessOwners = (id: string) => {
  const { authHeaders } = useSession();
  return useQuery({
    // TODO: Use owners once backend is ready
    queryKey: ['business', id, 'owners2'],
    queryFn: () => getBusinessOwners(authHeaders, { id }),
    enabled: !!id,
  });
};

export default useBusinessOwners;
