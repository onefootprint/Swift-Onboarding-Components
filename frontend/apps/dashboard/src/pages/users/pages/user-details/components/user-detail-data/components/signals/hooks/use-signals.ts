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
    scope: filters.query.signal_scope,
    description: filters.query.signal_description,
    severity: filters.query.signal_severity,
  };

  return useQuery(
    ['riskSignals', authHeaders, userId, params],
    () => getSignals({ authHeaders, userId, params }),
    { enabled: !!userId && typeof userId === 'string' },
  );
};

export default useSignals;
