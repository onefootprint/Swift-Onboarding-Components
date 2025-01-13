import request from '@onefootprint/request';

import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

const getRiskSignals = async (authHeaders: AuthHeaders): Promise<[]> => {
  try {
    const { data: response } = await request<[]>({
      headers: authHeaders,
      method: 'GET',
      url: 'org/risk_signals_spec',
    });
    return response;
  } catch {
    return [];
  }
};

const useRiskSignalsGrouped = (): UseQueryResult<[], Error> => {
  const { authHeaders } = useSession();
  return useQuery({
    queryKey: ['org', 'riskSignalsGrouped'],
    queryFn: () => getRiskSignals(authHeaders),
  });
};

export default useRiskSignalsGrouped;
