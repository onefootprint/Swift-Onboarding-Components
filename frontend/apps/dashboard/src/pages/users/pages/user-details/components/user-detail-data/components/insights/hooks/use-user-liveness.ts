import request, { RequestError } from '@onefootprint/request';
import { GetLivenessRequest, GetLivenessResponse } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import useSession from 'src/hooks/use-session';
import useUserId from 'src/pages/users/pages/user-details/hooks/use-user-id';

const getLivenessRequest = async ({
  userId,
  authHeaders,
}: GetLivenessRequest) => {
  const response = await request<GetLivenessResponse>({
    method: 'GET',
    url: `/entities/${userId}/liveness`,
    headers: authHeaders,
  });

  return response.data;
};

const useUserLiveness = () => {
  const userId = useUserId();
  const { authHeaders } = useSession();

  return useQuery<GetLivenessResponse, RequestError>(
    ['user', 'liveness', userId, authHeaders],
    () => getLivenessRequest({ authHeaders, userId }),
    {
      enabled: !!userId,
    },
  );
};

export default useUserLiveness;
