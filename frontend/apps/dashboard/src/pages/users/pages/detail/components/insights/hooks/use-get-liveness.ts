import { QueryFunctionContext, QueryKey, useQuery } from 'react-query';
import request, { RequestError, RequestResponse } from 'request';
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
  const { data: response } = await request<RequestResponse<Liveness[]>>({
    method: 'GET',
    url: '/org/liveness',
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
