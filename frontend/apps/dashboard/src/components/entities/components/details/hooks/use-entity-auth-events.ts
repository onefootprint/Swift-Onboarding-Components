import request, { RequestError } from '@onefootprint/request';
import { GetLivenessRequest, GetLivenessResponse } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import useSession, { AuthHeaders } from 'src/hooks/use-session';

const getAuthEvents = async (
  { id }: GetLivenessRequest,
  authHeaders: AuthHeaders,
) => {
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
    ['entity', 'authEvents', id],
    () => getAuthEvents({ id }, authHeaders),
    {
      enabled: !!id,
    },
  );
};

export default useEntityAuthEvents;
