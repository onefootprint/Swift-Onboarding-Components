import { QueryFunctionContext, QueryKey, useQuery } from 'react-query';
import request, { RequestError, RequestResponse } from 'request';
import useSessionUser from 'src/hooks/use-session-user';
import { InsightEvent } from 'src/types/insight-event';

import { DASHBOARD_AUTHORIZATION_HEADER } from '../../../../../../../config/constants';

type LivenessRequestQueryString = {
  footprintUserId: string;
};

type LivenessRequestQueryKey = [string, LivenessRequestQueryString, string];

type Liveness = {
  insightEvent: InsightEvent;
};

const getLivenessRequest = async ({
  queryKey,
}: QueryFunctionContext<QueryKey, string>) => {
  const [, params, auth] = queryKey as LivenessRequestQueryKey;
  const { data: response } = await request<RequestResponse<Liveness[]>>({
    method: 'GET',
    url: '/org/liveness',
    params,
    headers: { [DASHBOARD_AUTHORIZATION_HEADER]: auth as string },
  });
  return response.data;
};

const useGetLiveness = (footprintUserId: string) => {
  const session = useSessionUser();
  const auth = session.data?.auth;
  const filters = {
    footprintUserId,
  };

  return useQuery<Liveness[], RequestError>(
    ['liveness', filters, auth],
    getLivenessRequest,
    {
      retry: false,
    },
  );
};

export default useGetLiveness;
