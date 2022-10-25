import request from '@onefootprint/request';
import type {
  GetRiskSignalsRequest,
  GetRiskSignalsResponse,
} from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import useSessionUser from 'src/hooks/use-session-user';

import useUserId from '../../../../../hooks/use-user-id';
import useSignalFilters from './use-signals-filters';

const getSignals = async ({
  authHeaders,
  userId,
  params,
}: GetRiskSignalsRequest) => {
  const { data: response } = await request<GetRiskSignalsResponse>({
    headers: authHeaders,
    method: 'GET',
    url: `/users/${userId}/risk_signals`,
    params,
  });
  return response;
};

const useSignals = () => {
  const filters = useSignalFilters();
  const { authHeaders } = useSessionUser();
  const userId = useUserId();
  const params = {
    signal_note: filters.query.signal_note,
    signal_scope: filters.query.signal_scope,
    signal_search: filters.query.signal_search,
    signal_severity: filters.query.signal_severity,
  };

  return useQuery(
    ['riskSignals', authHeaders, userId, params],
    () => getSignals({ authHeaders, userId, params }),
    { enabled: !!userId && typeof userId === 'string' },
  );
};

export default useSignals;
