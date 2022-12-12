import request, { RequestError } from '@onefootprint/request';
import { InsightEvent } from '@onefootprint/types';
import {
  QueryFunctionContext,
  QueryKey,
  useQuery,
} from '@tanstack/react-query';
import useSession, { AuthHeaders } from 'src/hooks/use-session';

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
    url: `/users/${params.footprintUserId}/liveness`,
    params,
    headers: authHeaders,
  });
  return response.data;
};

const useGetLiveness = (footprintUserId: string) => {
  const { authHeaders } = useSession();
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
