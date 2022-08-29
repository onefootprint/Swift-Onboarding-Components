import {
  QueryFunctionContext,
  QueryKey,
  useQuery,
} from '@tanstack/react-query';
import request, { RequestError } from 'request';
import useSessionUser, { AuthHeaders } from 'src/hooks/use-session-user';
import { InsightEvent } from 'src/types/insight-event';

type LivenessRequestQueryString = {
  footprintUserId: string;
};

type LivenessRequestQueryKey = [
  string,
  LivenessRequestQueryString,
  AuthHeaders,
];

type Liveness = {
  insightEvent: InsightEvent;
};

const getLivenessRequest = async ({
  queryKey,
}: QueryFunctionContext<QueryKey, string>) => {
  const [, params, authHeaders] = queryKey as LivenessRequestQueryKey;
  const response = await request<Liveness[]>({
    method: 'GET',
    url: '/users/liveness',
    params,
    headers: authHeaders,
  });
  return response.data;
};

const useGetLiveness = (footprintUserId: string) => {
  const { authHeaders } = useSessionUser();
  const filters = {
    footprintUserId,
  };

  return useQuery<Liveness[], RequestError>(
    ['liveness', filters, authHeaders],
    getLivenessRequest,
    {
      retry: false,
    },
  );
};

export default useGetLiveness;
