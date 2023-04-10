import request, { RequestError } from '@onefootprint/request';
import { GetLivenessRequest, GetLivenessResponse } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import useSession, { AuthHeaders } from 'src/hooks/use-session';
import useUserId from 'src/pages/users/pages/user-details/hooks/use-user-id';

const getLivenessRequest = async (
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

const useUserLiveness = () => {
  const id = useUserId();
  const { authHeaders } = useSession();

  return useQuery<GetLivenessResponse, RequestError>(
    ['user', 'liveness', id, authHeaders],
    () => getLivenessRequest({ id }, authHeaders),
    {
      enabled: !!id,
    },
  );
};

export default useUserLiveness;
