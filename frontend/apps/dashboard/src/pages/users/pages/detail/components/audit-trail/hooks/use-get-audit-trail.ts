import {
  QueryFunctionContext,
  QueryKey,
  useQuery,
} from '@tanstack/react-query';
import request, { RequestError, RequestResponse } from 'request';
import useSessionUser, { AuthHeaders } from 'src/hooks/use-session-user';
import { AuditTrail } from 'src/types';

type AuditTrailRequestQueryString = {
  footprintUserId: string;
};

type AuditTrailRequestQueryKey = [
  string,
  AuditTrailRequestQueryString,
  AuthHeaders,
];

const getAuditTrailRequest = async ({
  queryKey,
}: QueryFunctionContext<QueryKey, string>) => {
  const [, params, authHeaders] = queryKey as AuditTrailRequestQueryKey;
  const { data: response } = await request<RequestResponse<AuditTrail[]>>({
    method: 'GET',
    url: '/org/audit_trail',
    params,
    headers: authHeaders,
  });
  return response.data;
};

const useGetAuditTrail = (footprintUserId: string) => {
  const { authHeaders } = useSessionUser();
  const filters = {
    footprintUserId,
  };

  return useQuery<AuditTrail[], RequestError>(
    ['AuditTrail', filters, authHeaders],
    getAuditTrailRequest,
    {
      retry: false,
    },
  );
};

export default useGetAuditTrail;
