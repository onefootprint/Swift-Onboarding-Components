import request from '@onefootprint/request';
import type {
  GetRiskSignalsRequest,
  GetRiskSignalsResponse,
} from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import useSession, { AuthHeaders } from 'src/hooks/use-session';

import useUserId from '../../../../../hooks/use-user-id';
import useRiskSignalsFilters from './use-risk-signals-filters';

const getRiskSignalsRequest = async (
  params: GetRiskSignalsRequest,
  userId: string,
  authHeaders: AuthHeaders,
) => {
  const { data: response } = await request<GetRiskSignalsResponse>({
    headers: authHeaders,
    method: 'GET',
    params,
    url: `/users/${userId}/risk_signals`,
  });
  return response;
};

const useRiskSignals = () => {
  const filters = useRiskSignalsFilters();
  const { authHeaders } = useSession();
  const userId = useUserId();

  return useQuery(
    ['userRiskSignalsList', authHeaders, userId, filters.requestParams],
    () => getRiskSignalsRequest(filters.requestParams, userId, authHeaders),
    { enabled: !!userId && filters.isReady },
  );
};

export default useRiskSignals;
