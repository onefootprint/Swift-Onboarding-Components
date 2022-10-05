import request, { PaginatedRequestResponse } from '@onefootprint/request';
import type { RiskSignal } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import useSessionUser, { AuthHeaders } from 'src/hooks/use-session-user';

import useSignalFilters, { SignalListQueryParams } from './use-signals-filters';

export type GetSignalsRequest = {
  authHeaders: AuthHeaders;
  params: SignalListQueryParams;
};

export type GetSignalsResponse = PaginatedRequestResponse<RiskSignal[]>;

// TODO: Integrate real api
// https://linear.app/footprint/issue/FP-1518/integrate-real-api
const getSignals = async ({ authHeaders, params }: GetSignalsRequest) => {
  const { data: response } = await request<GetSignalsResponse>({
    baseURL: 'https://demo7616817.mockable.io',
    headers: authHeaders,
    method: 'GET',
    url: '/risk-signals',
    withCredentials: false,
    params,
  });
  return response;
};

const useSignals = () => {
  const filters = useSignalFilters();
  const { authHeaders } = useSessionUser();
  const params = {
    signal_note: filters.query.signal_note,
    signal_scope: filters.query.signal_scope,
    signal_search: filters.query.signal_search,
    signal_severity: filters.query.signal_severity,
  };

  return useQuery(['riskSignals', authHeaders, params], () =>
    getSignals({ authHeaders, params }),
  );
};

export default useSignals;
