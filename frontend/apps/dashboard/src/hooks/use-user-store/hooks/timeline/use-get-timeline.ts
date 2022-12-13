import request, { RequestError } from '@onefootprint/request';
import { GetTimelineRequest, GetTimelineResponse } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import useSession from 'src/hooks/use-session';

const getTimelineRequest = async ({
  userId,
  authHeaders,
}: GetTimelineRequest) => {
  const response = await request<GetTimelineResponse>({
    method: 'GET',
    url: `/users/${userId}/timeline`,
    headers: authHeaders,
  });

  return response.data;
};

const useGetTimeline = (userId: string) => {
  const { authHeaders } = useSession();

  return useQuery<GetTimelineResponse, RequestError>(
    ['timeline', userId, authHeaders],
    () => getTimelineRequest({ userId, authHeaders }),
    {
      enabled: !!userId,
      retry: false,
    },
  );
};

export default useGetTimeline;
