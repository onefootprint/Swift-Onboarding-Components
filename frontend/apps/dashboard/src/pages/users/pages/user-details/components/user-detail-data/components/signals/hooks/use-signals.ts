import request, { PaginatedRequestResponse } from '@onefootprint/request';
import type { RiskSignal } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import useSessionUser, { AuthHeaders } from 'src/hooks/use-session-user';

export type GetSignalsRequest = {
  authHeaders: AuthHeaders;
};

export type GetSignalsResponse = PaginatedRequestResponse<RiskSignal[]>;

// TODO: Integrate real api
// https://linear.app/footprint/issue/FP-1518/integrate-real-api
const getSignals = async ({ authHeaders }: GetSignalsRequest) => {
  console.log('authHeaders', authHeaders);
  const { data: response } = await request<GetSignalsResponse>({
    baseURL: 'https://demo7616817.mockable.io',
    // headers: authHeaders,
    method: 'GET',
    url: '/risk-signals',
    withCredentials: false,
  });
  return response;
};

const useSignals = () => {
  const { authHeaders } = useSessionUser();
  return useQuery(['risk-signals', authHeaders], () =>
    getSignals({ authHeaders }),
  );
};

export default useSignals;
