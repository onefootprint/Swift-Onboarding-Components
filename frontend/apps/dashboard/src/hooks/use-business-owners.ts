import request from '@onefootprint/request';
import {
  type GetBusinessOwnersRequest,
  type GetBusinessOwnersResponse,
  type GetEntityResponse,
  IdDI,
} from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

const getBusinessOwners = async (authHeaders: AuthHeaders, { id }: GetBusinessOwnersRequest) => {
  const businessOwnersResponse = await request<GetBusinessOwnersResponse>({
    method: 'GET',
    url: `/entities/${id}/business_owners`,
    headers: authHeaders,
  });

  const ownerIds = businessOwnersResponse.data.map(owner => owner.id).filter(Boolean);
  const entityResponses = await Promise.all(
    ownerIds.map(id =>
      request<GetEntityResponse>({
        method: 'GET',
        url: `/entities/${id}`,
        headers: authHeaders,
      }),
    ),
  );
  return entityResponses
    .map(({ data: entity }) => {
      return {
        id: entity.id,
        attributes: entity.attributes,
        firstName: (entity.data.find(item => item.identifier === IdDI.firstName)?.value as string) || '',
        lastName: (entity.data.find(item => item.identifier === IdDI.lastName)?.transforms?.prefix_1 as string) || '',
        hasPhone: entity.attributes.includes(IdDI.phoneNumber),
      };
    })
    .filter(entity => entity.firstName);
};

const useBusinessOwners = (id: string) => {
  const { authHeaders } = useSession();
  return useQuery({
    queryKey: ['business', id, 'business-owners'],
    queryFn: () => getBusinessOwners(authHeaders, { id }),
    enabled: !!id,
  });
};

export default useBusinessOwners;
