import request from '@onefootprint/request';
import {
  GetRiskSignalDetailsRequest,
  GetRiskSignalDetailsResponse,
} from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import useSession from 'src/hooks/use-session';

import useUserId from '../../../../../../../hooks/use-user-id';

const getRiskSignalDetails = async ({
  authHeaders,
  riskSignalId,
  entityId,
}: GetRiskSignalDetailsRequest) => {
  const { data: response } = await request<GetRiskSignalDetailsResponse>({
    headers: authHeaders,
    method: 'GET',
    url: `/entities/${entityId}/risk_signals/${riskSignalId}`,
  });
  return response;
};

const useRiskSignalDetails = (riskSignalId = '') => {
  const { authHeaders } = useSession();
  const entityId = useUserId();

  return useQuery(
    ['risk-signal-details', authHeaders, entityId, riskSignalId],
    () => getRiskSignalDetails({ authHeaders, entityId, riskSignalId }),
    {
      enabled: !!riskSignalId,
    },
  );
};

export default useRiskSignalDetails;
