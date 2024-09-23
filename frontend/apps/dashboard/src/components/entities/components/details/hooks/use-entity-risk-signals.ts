import request from '@onefootprint/request';
import type { GetEntityRiskSignalsRequest, GetEntityRiskSignalsResponse } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

import useRiskSignalsFilters from './use-risk-signals-filters';

const getRiskSignals = async (payload: GetEntityRiskSignalsRequest, authHeaders: AuthHeaders) => {
  const { id, ...params } = payload;
  const { data: response } = await request<GetEntityRiskSignalsResponse>({
    headers: authHeaders,
    method: 'GET',
    params,
    url: `/entities/${id}/risk_signals`,
  });

  return response;
};

const useEntityRiskSignals = (id: string, seqno?: string | undefined) => {
  const filters = useRiskSignalsFilters();
  const { authHeaders } = useSession();

  return useQuery(
    ['entity', id, 'risk-signals', filters.requestParams, seqno, authHeaders],
    () => getRiskSignals({ ...filters.requestParams, seqno, id }, authHeaders),
    { enabled: !!id, keepPreviousData: true },
  );
};

export default useEntityRiskSignals;
