import request from '@onefootprint/request';
import type { GetEntityOwnedBusinessIdsRequest, GetEntityOwnedBusinessIdsResponse } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

const getBusinessIds = async ({ entityId }: GetEntityOwnedBusinessIdsRequest, authHeaders: AuthHeaders) => {
  const { data: response } = await request<GetEntityOwnedBusinessIdsResponse>({
    headers: authHeaders,
    method: 'GET',
    url: `/entities/${entityId}/businesses`,
  });

  return response;
};

const useGetEntityOwnedBusinessIds = (id: string) => {
  const { authHeaders } = useSession();

  return useQuery(['entity', id, 'owned_business_ids'], () => getBusinessIds({ entityId: id }, authHeaders), {
    enabled: !!id,
  });
};

export default useGetEntityOwnedBusinessIds;
