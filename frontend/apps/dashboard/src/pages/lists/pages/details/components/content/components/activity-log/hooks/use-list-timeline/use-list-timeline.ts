import request, { getErrorMessage } from '@onefootprint/request';
import type {
  GetListTimelineRequest,
  GetListTimelineResponse,
  ListTimeline,
} from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import useSession from 'src/hooks/use-session';

const getListTimeline = async ({ authHeaders, id }: GetListTimelineRequest) => {
  const response = await request<GetListTimelineResponse>({
    method: 'GET',
    url: `/org/${id}/timeline`,
    headers: authHeaders,
  });

  return response.data;
};

const useListTimeline = (id: string = '') => {
  const { authHeaders } = useSession();
  const query = useQuery<ListTimeline>(['list-timeline', id, authHeaders], () =>
    getListTimeline({ authHeaders, id }),
  );
  const { error } = query;
  const errorMessage = error ? getErrorMessage(error) : undefined;

  return {
    ...query,
    errorMessage,
  };
};

export default useListTimeline;
