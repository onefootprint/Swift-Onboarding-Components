import request from '@onefootprint/request';
import {
  GetRiskSignalDetailsRequest,
  GetRiskSignalDetailsResponse,
} from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import useSessionUser from 'src/hooks/use-session-user';

import useUserId from '../../../../../../../hooks/use-user-id';

const getRiskSignalDetails = async ({
  authHeaders,
  riskSignalId,
  userId,
}: GetRiskSignalDetailsRequest) => {
  const { data: response } = await request<GetRiskSignalDetailsResponse>({
    headers: authHeaders,
    method: 'GET',
    url: `/users/${userId}/risk_signals/${riskSignalId}`,
  });
  return response;
};

const useRiskSignalDetails = (riskSignalId = '') => {
  const { authHeaders } = useSessionUser();
  const userId = useUserId();

  return useQuery(
    ['risk-signal-details', authHeaders, userId, riskSignalId],
    () => getRiskSignalDetails({ authHeaders, userId, riskSignalId }),
    {
      enabled: !!riskSignalId,
    },
  );
};

export default useRiskSignalDetails;
