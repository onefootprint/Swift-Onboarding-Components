import request from '@onefootprint/request';
import { GetTimelineResponse } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import useSession, { AuthHeaders } from 'src/hooks/use-session';

const getTimeline = async (userId: string, authHeaders: AuthHeaders) => {
  const response = await request<GetTimelineResponse>({
    method: 'GET',
    url: `/entities/${userId}/timeline`,
    headers: authHeaders,
  });

  return response.data;
};

const useEntityTimeline = (id: string) => {
  const { authHeaders } = useSession();

  return useQuery(
    ['entity', id, 'timeline'],
    () => getTimeline(id, authHeaders),
    {
      enabled: !!id,
    },
  );
};

export default useEntityTimeline;
