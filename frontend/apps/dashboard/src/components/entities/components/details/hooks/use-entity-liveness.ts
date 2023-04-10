import request, { RequestError } from '@onefootprint/request';
import { GetLivenessRequest, GetLivenessResponse } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import useSession, { AuthHeaders } from 'src/hooks/use-session';

const getLiveness = async (
  { id }: GetLivenessRequest,
  authHeaders: AuthHeaders,
) => {
  const response = await request<GetLivenessResponse>({
    method: 'GET',
    url: `/entities/${id}/liveness`,
    headers: authHeaders,
  });

  return response.data;
};

const useEntityLiveness = (id: string) => {
  const { authHeaders } = useSession();

  return useQuery<GetLivenessResponse, RequestError>(
    ['entity', 'liveness', id],
    () => getLiveness({ id }, authHeaders),
    {
      enabled: !!id,
    },
  );
};

export default useEntityLiveness;
