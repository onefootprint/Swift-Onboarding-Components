import useSessionUser from '@src/hooks/use-session-user';
import { DataKind } from '@src/pages/users/hooks/use-decrypt-user';
import { useQuery } from 'react-query';
import request, { RequestError, RequestResponse } from 'request';
import { useFilters } from 'src/pages/users/hooks/use-filters';

import { DASHBOARD_AUTHORIZATION_HEADER } from '../../../config/constants';

type AccessEventsRequest = {};

export type AccessEvent = {
  dataKind: DataKind;
  fpUserId: string;
  reason: string;
  tenantId: string;
  timestamp: string;
  principal: string;
};

// TODO pagination
const getAccessEventsRequest = async (
  params: AccessEventsRequest,
  auth?: string,
) => {
  const { data: response } = await request<RequestResponse<AccessEvent[]>>({
    method: 'GET',
    url: '/org/access_events',
    params,
    headers: { [DASHBOARD_AUTHORIZATION_HEADER]: auth as string },
  });
  return response.data;
};

const useGetAccessEvents = () => {
  const session = useSessionUser();
  const auth = session.data?.auth;

  const { query } = useFilters();
  return useQuery<AccessEvent[], RequestError>(
    ['paginatedAccessEvents', query, auth],
    () => getAccessEventsRequest(query, auth),
    {
      retry: false,
    },
  );
};

export default useGetAccessEvents;
