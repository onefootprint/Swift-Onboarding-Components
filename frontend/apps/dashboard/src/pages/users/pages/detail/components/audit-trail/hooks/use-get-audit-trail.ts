import { QueryFunctionContext, QueryKey, useQuery } from 'react-query';
import request, { RequestError, RequestResponse } from 'request';
import useSessionUser from 'src/hooks/use-session-user';
import { AuditTrail } from 'src/types';

import { DASHBOARD_AUTHORIZATION_HEADER } from '../../../../../../../config/constants';

type AuditTrailRequestQueryString = {
  footprintUserId: string;
};

type AuditTrailRequestQueryKey = [string, AuditTrailRequestQueryString, string];

const getAuditTrailRequest = async ({
  queryKey,
}: QueryFunctionContext<QueryKey, string>) => {
  const [, params, auth] = queryKey as AuditTrailRequestQueryKey;
  const { data: response } = await request<RequestResponse<AuditTrail[]>>({
    method: 'GET',
    url: '/org/audit_trail',
    params,
    headers: { [DASHBOARD_AUTHORIZATION_HEADER]: auth as string },
  });
  return response.data;
};

const useGetAuditTrail = (footprintUserId: string) => {
  const session = useSessionUser();
  const auth = session.data?.auth;
  const filters = {
    footprintUserId,
  };

  return useQuery<AuditTrail[], RequestError>(
    ['AuditTrail', filters, auth],
    getAuditTrailRequest,
    {
      retry: false,
    },
  );
};

export default useGetAuditTrail;
