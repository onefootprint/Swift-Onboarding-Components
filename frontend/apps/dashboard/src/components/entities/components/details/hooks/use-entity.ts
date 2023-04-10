import request from '@onefootprint/request';
import {
  augmentEntityWithOnboardingInfo,
  GetEntityRequest,
  GetEntityResponse,
} from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import useSession, { AuthHeaders } from 'src/hooks/use-session';

const getEntity = async (
  authHeaders: AuthHeaders,
  { id }: GetEntityRequest,
) => {
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

  return useQuery(['entity', id], () => getEntity(authHeaders, { id }), {
    enabled: isReady && !!id,
    select: (response: GetEntityResponse) =>
      augmentEntityWithOnboardingInfo(response),
  });
};

export default useEntity;
