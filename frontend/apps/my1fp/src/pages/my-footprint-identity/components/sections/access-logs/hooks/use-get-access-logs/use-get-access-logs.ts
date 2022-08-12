import {
  QueryFunctionContext,
  QueryKey,
  useInfiniteQuery,
} from '@tanstack/react-query';
import request, { RequestError, RequestResponse } from 'request';
import { MY1FP_AUTH_HEADER } from 'src/config/constants';

import { AccessLog } from '../../types';

export type AccessLogsRequest = {
  authToken: string;
};

export type AccessLogsResponse = {
  data: AccessLog[];
  next?: string;
};

type AccessLogQueryKey = [string, null, string];

const getAccessLogsRequest = async ({
  queryKey,
  pageParam,
}: QueryFunctionContext<QueryKey, string>) => {
  const [, , authToken] = queryKey as AccessLogQueryKey;
  const { data: response } = await request<RequestResponse<AccessLog[]>>({
    method: 'GET',
    url: '/hosted/user/access_events',
    params: { cursor: pageParam },
    headers: {
      [MY1FP_AUTH_HEADER]: authToken,
    },
  });
  return response;
};

const useGetAccessLogs = (authToken?: string) =>
  useInfiniteQuery<AccessLogsResponse, RequestError>(
    ['paginatedAccessEvents', null, authToken],
    getAccessLogsRequest,
    {
      retry: false,
      enabled: !!authToken,
      getNextPageParam: lastPage => lastPage.next,
    },
  );

export default useGetAccessLogs;
