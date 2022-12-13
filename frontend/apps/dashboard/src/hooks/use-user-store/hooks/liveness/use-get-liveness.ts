import request, { RequestError } from '@onefootprint/request';
import { GetLivenessRequest, GetLivenessResponse } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import useSession from 'src/hooks/use-session';

const getLivenessRequest = async ({
  userId,
  authHeaders,
}: GetLivenessRequest) => {
  const response = await request<GetLivenessResponse>({
    method: 'GET',
    url: `/users/${userId}/liveness`,
    headers: authHeaders,
  });

  return response.data;
};

const useGetLiveness = (userId: string) => {
  const { authHeaders } = useSession();

  return useQuery<GetLivenessResponse, RequestError>(
    ['liveness', userId, authHeaders],
    () => getLivenessRequest({ authHeaders, userId }),
    {
      enabled: !!userId,
      retry: false,
    },
  );
};

export default useGetLiveness;
