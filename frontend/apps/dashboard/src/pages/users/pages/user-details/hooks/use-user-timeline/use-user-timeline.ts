import request from '@onefootprint/request';
import { GetTimelineResponse } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import useSession, { AuthHeaders } from 'src/hooks/use-session';

const getTimelineRequest = async (userId: string, authHeaders: AuthHeaders) => {
  const response = await request<GetTimelineResponse>({
    method: 'GET',
    url: `/users/${userId}/timeline`,
    headers: authHeaders,
  });
  return response.data;
};

const useUserTimeline = (userId: string) => {
  const { authHeaders } = useSession();

  return useQuery(
    ['user', userId, 'timeline'],
    () => getTimelineRequest(userId, authHeaders),
    {
      enabled: !!userId,
    },
  );
};

export default useUserTimeline;
