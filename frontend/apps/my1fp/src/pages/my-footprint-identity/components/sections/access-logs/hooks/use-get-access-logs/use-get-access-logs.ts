import request, { RequestError } from '@onefootprint/request';
import { AccessLog } from '@onefootprint/types';
import {
  QueryFunctionContext,
  QueryKey,
  useInfiniteQuery,
} from '@tanstack/react-query';
import { MY1FP_AUTH_HEADER } from 'src/config/constants';

export type AccessLogsRequest = {
  authToken: string;
};

export type AccessLogsResponse = AccessLog[];

type AccessLogQueryKey = [string, null, string];

const getAccessLogsRequest = async ({
  queryKey,
  pageParam,
}: QueryFunctionContext<QueryKey, string>) => {
  const [, , authToken] = queryKey as AccessLogQueryKey;
  const response = await request<AccessLog[]>({
    method: 'GET',
    url: '/hosted/user/access_events',
    params: { cursor: pageParam, kind: 'decrypt' },
    headers: {
      [MY1FP_AUTH_HEADER]: authToken,
    },
  });
  return response.data;
};

const useGetAccessLogs = (authToken?: string) =>
  useInfiniteQuery<AccessLogsResponse, RequestError>(
    ['paginatedAccessEvents', null, authToken],
    getAccessLogsRequest,
    {
      retry: false,
      enabled: !!authToken,
      // TODO: add pagination
      getNextPageParam: () => null,
    },
  );

export default useGetAccessLogs;
