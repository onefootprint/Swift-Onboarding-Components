import request from '@onefootprint/request';
import type { GetUserInsightsResponse } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

const getOtherInsights = async (userId: string, authHeaders: AuthHeaders) => {
  const response = await request<GetUserInsightsResponse>({
    method: 'GET',
    url: `/entities/${userId}/user_insights`,
    headers: authHeaders,
  });

  return response.data;
};

const useEntityOtherInsights = (id: string) => {
  const { authHeaders } = useSession();

  return useQuery(
    ['entity', id, 'otherInsights', authHeaders],
    () => getOtherInsights(id, authHeaders),
    {
      enabled: !!id,
      select: response =>
        response.map(item => ({
          ...item,
          scope: item.scope.toLocaleLowerCase(),
        })),
    },
  );
};

export default useEntityOtherInsights;
