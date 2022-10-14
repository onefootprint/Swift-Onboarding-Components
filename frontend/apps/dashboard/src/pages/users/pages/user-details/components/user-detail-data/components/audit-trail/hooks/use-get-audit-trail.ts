import request, { RequestError } from '@onefootprint/request';
import { AuditTrail } from '@onefootprint/types';
import {
  QueryFunctionContext,
  QueryKey,
  useQuery,
} from '@tanstack/react-query';
import useSessionUser, { AuthHeaders } from 'src/hooks/use-session-user';

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
  const response = await request<AuditTrail[]>({
    method: 'GET',
    url: `/users/${params.footprintUserId}/audit_trail`,
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
