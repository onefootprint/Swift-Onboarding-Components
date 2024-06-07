import request from '@onefootprint/request';
import type { GetOrgRiskSignalsResponse } from '@onefootprint/types';
import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

const getRiskSignals = async (authHeaders: AuthHeaders): Promise<GetOrgRiskSignalsResponse | null> => {
  try {
    const { data: response } = await request<GetOrgRiskSignalsResponse>({
      headers: authHeaders,
      method: 'GET',
      url: 'org/risk_signals',
    });
    return response;
  } catch {
    return null;
  }
};

const useRiskSignals = (): UseQueryResult<GetOrgRiskSignalsResponse | null, Error> => {
  const { authHeaders } = useSession();

  return useQuery(['org', 'riskSignals'], () => getRiskSignals(authHeaders), {
    select: riskSignals => (riskSignals ? riskSignals.sort((a, b) => (a.reasonCode > b.reasonCode ? 1 : -1)) : null),
  });
};

export default useRiskSignals;
