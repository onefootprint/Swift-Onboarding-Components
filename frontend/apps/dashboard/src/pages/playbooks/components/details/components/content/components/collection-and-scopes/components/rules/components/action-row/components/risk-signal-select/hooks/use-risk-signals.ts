import request from '@onefootprint/request';
import type { GetOrgRiskSignalsResponse } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

const getRiskSignals = async (authHeaders: AuthHeaders) => {
  const { data: response } = await request<GetOrgRiskSignalsResponse>({
    headers: authHeaders,
    method: 'GET',
    url: 'org/risk_signals',
  });

  return response;
};

const useRiskSignals = () => {
  const { authHeaders } = useSession();

  return useQuery(['org', 'riskSignals'], () => getRiskSignals(authHeaders));
};

export default useRiskSignals;
