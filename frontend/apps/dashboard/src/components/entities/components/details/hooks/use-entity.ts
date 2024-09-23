import request from '@onefootprint/request';
import type { GetEntityRequest, GetEntityResponse } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

export const getEntity = async (authHeaders: AuthHeaders, { id }: GetEntityRequest) => {
  const response = await request<GetEntityResponse>({
    method: 'GET',
    url: `/entities/${id}`,
    headers: authHeaders,
  });

  return response.data;
};

const useEntity = (id: string) => {
  const isReady = useRouter();
  const { authHeaders } = useSession();

  return useQuery({
    queryKey: ['entity', id, authHeaders],
    queryFn: () => getEntity(authHeaders, { id }),
    enabled: isReady && !!id,
  });
};

export default useEntity;
