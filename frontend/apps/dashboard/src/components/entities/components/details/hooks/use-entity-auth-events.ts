import type { RequestError } from '@onefootprint/request';
import request from '@onefootprint/request';
import type { GetLivenessRequest, GetLivenessResponse } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

const getAuthEvents = async ({ id }: GetLivenessRequest, authHeaders: AuthHeaders) => {
  const response = await request<GetLivenessResponse>({
    method: 'GET',
    url: `/entities/${id}/auth_events`,
    headers: authHeaders,
  });

  return response.data;
};

const useEntityAuthEvents = (id: string) => {
  const { authHeaders } = useSession();

  return useQuery<GetLivenessResponse, RequestError>(
    ['entity', 'authEvents', id, authHeaders],
    () => getAuthEvents({ id }, authHeaders),
    {
      enabled: !!id,
    },
  );
};

export default useEntityAuthEvents;
