import request from '@onefootprint/request';
import type { GetTimelineResponse } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

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

  return useQuery(['entity', id, 'timeline', authHeaders], () => getTimeline(id, authHeaders), {
    enabled: !!id,
  });
};

export default useEntityTimeline;
