import request from '@onefootprint/request';
import type {
  GetEntityRiskSignalsRequest,
  GetEntityRiskSignalsResponse,
} from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import useSession, { AuthHeaders } from 'src/hooks/use-session';

import useUserId from '../../../../../hooks/use-user-id';
import useRiskSignalsFilters from './use-risk-signals-filters';

const getRiskSignalsRequest = async (
  payload: GetEntityRiskSignalsRequest,
  authHeaders: AuthHeaders,
) => {
  const { id, ...params } = payload;
  const { data: response } = await request<GetEntityRiskSignalsResponse>({
    headers: authHeaders,
    method: 'GET',
    params,
    url: `/entities/${id}/risk_signals`,
  });
  return response;
};

const useRiskSignals = () => {
  const filters = useRiskSignalsFilters();
  const { authHeaders } = useSession();
  const id = useUserId();

  return useQuery(
    ['user', id, 'riskSignals', filters.requestParams],
    () => getRiskSignalsRequest({ ...filters.requestParams, id }, authHeaders),
    { enabled: !!id && filters.isReady },
  );
};

export default useRiskSignals;
