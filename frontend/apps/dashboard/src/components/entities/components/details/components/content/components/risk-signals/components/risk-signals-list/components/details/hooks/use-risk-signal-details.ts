import request from '@onefootprint/request';
import type { GetRiskSignalDetailsRequest, GetRiskSignalDetailsResponse } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import useSession from 'src/hooks/use-session';

import useEntityId from '@/entity/hooks/use-entity-id';

const getRiskSignalDetails = async ({ authHeaders, entityId, riskSignalId }: GetRiskSignalDetailsRequest) => {
  const { data: response } = await request<GetRiskSignalDetailsResponse>({
    headers: authHeaders,
    method: 'GET',
    url: `/entities/${entityId}/risk_signals/${riskSignalId}`,
  });

  return response;
};

const useRiskSignalDetails = (riskSignalId = '') => {
  const { authHeaders } = useSession();
  const entityId = useEntityId();

  return useQuery(
    ['entity', entityId, 'risk-signals', riskSignalId],
    () => getRiskSignalDetails({ authHeaders, entityId, riskSignalId }),
    {
      enabled: !!riskSignalId,
    },
  );
};

export default useRiskSignalDetails;
