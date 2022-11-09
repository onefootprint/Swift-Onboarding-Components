import request, { RequestError } from '@onefootprint/request';
import { Timeline } from '@onefootprint/types';
import {
  QueryFunctionContext,
  QueryKey,
  useQuery,
} from '@tanstack/react-query';
import useSessionUser, { AuthHeaders } from 'src/hooks/use-session-user';

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

const useGetTimeline = (footprintUserId: string) => {
  const { authHeaders } = useSessionUser();
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
