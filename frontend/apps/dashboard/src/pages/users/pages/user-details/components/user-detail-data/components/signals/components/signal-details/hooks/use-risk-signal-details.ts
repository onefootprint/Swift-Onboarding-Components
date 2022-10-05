import request from '@onefootprint/request';
import type { RiskSignalDetails } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import useSessionUser, { AuthHeaders } from 'src/hooks/use-session-user';

export type GetRiskDetailsRequest = {
  id: string;
  authHeaders: AuthHeaders;
};

export type GetRiskSignalDetailsResponse = RiskSignalDetails;

// TODO: Integrate real api
// https://linear.app/footprint/issue/FP-1518/integrate-real-api
const getRiskSignalDetails = async ({ authHeaders }: GetRiskDetailsRequest) => {
  const { data: response } = await request<GetRiskSignalDetailsResponse>({
    baseURL: 'http://demo7616817.mockable.io',
    headers: authHeaders,
    method: 'GET',
    url: '/risk-signals-details',
    withCredentials: false,
  });
  return response;
};

const useRiskSignalDetails = (id = '') => {
  const { authHeaders } = useSessionUser();
  return useQuery(
    ['risk-signal-details', authHeaders, id],
    () => getRiskSignalDetails({ authHeaders, id }),
    {
      enabled: !!id,
    },
  );
};

export default useRiskSignalDetails;
