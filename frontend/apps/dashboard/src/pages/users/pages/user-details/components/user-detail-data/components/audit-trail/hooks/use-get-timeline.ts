import request, { RequestError } from '@onefootprint/request';
import { Timeline } from '@onefootprint/types';
import {
  QueryFunctionContext,
  QueryKey,
  useQuery,
} from '@tanstack/react-query';
import useSession, { AuthHeaders } from 'src/hooks/use-session';
import useUserId from 'src/pages/users/pages/user-details/hooks/use-user-id';

type TimelineRequestQueryString = {
  footprintUserId: string;
};

type TimelineRequestQueryKey = [
  string,
  TimelineRequestQueryString,
  AuthHeaders,
];

const getTimelineRequest = async ({
  queryKey,
}: QueryFunctionContext<QueryKey, string>) => {
  const [, params, authHeaders] = queryKey as TimelineRequestQueryKey;
  const response = await request<Timeline>({
    method: 'GET',
    url: `/users/${params.footprintUserId}/timeline`,
    headers: authHeaders,
  });
  return response.data;
};

const useGetTimeline = () => {
  const { authHeaders } = useSession();
  const footprintUserId = useUserId();
  const filters = {
    footprintUserId,
  };

  return useQuery<Timeline, RequestError>(
    ['timeline', filters, authHeaders],
    getTimelineRequest,
    {
      retry: false,
    },
  );
};

export default useGetTimeline;
