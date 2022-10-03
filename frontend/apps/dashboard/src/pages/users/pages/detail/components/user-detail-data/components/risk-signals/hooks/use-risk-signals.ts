import request, { PaginatedRequestResponse } from '@onefootprint/request';
import type { RiskSignal } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import useSessionUser, { AuthHeaders } from 'src/hooks/use-session-user';

export type GetRiskSignalsRequest = {
  authHeaders: AuthHeaders;
};

export type GetRiskSignalsResponse = PaginatedRequestResponse<RiskSignal[]>;

// TODO: Integrate real api
// https://linear.app/footprint/issue/FP-1518/integrate-real-api
const getRiskSignals = async ({ authHeaders }: GetRiskSignalsRequest) => {
  console.log('authHeaders', authHeaders);
  const { data: response } = await request<GetRiskSignalsResponse>({
    baseURL: 'https://demo7616817.mockable.io',
    // headers: authHeaders,
    method: 'GET',
    url: '/risk-signals',
    withCredentials: false,
  });
  return response;
};

const useRiskSignals = () => {
  const { authHeaders } = useSessionUser();
  return useQuery(['risk-signals', authHeaders], () =>
    getRiskSignals({ authHeaders }),
  );
};

export default useRiskSignals;
