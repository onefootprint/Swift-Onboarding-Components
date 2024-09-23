import request from '@onefootprint/request';
import type { DecryptRiskSignalAmlHitsRequest, DecryptRiskSignalAmlHitsResponse } from '@onefootprint/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useSession from 'src/hooks/use-session';

import useEntityId from '@/entity/hooks/use-entity-id';

const decryptRiskSignalAmlHits = async ({ authHeaders, entityId, riskSignalId }: DecryptRiskSignalAmlHitsRequest) => {
  const { data: response } = await request<DecryptRiskSignalAmlHitsResponse>({
    headers: authHeaders,
    method: 'POST',
    url: `/entities/${entityId}/decrypt_aml_hits/${riskSignalId}`,
  });

  return response;
};

const useRiskSignalAmlHits = () => {
  const { authHeaders } = useSession();
  const entityId = useEntityId();
  const queryClient = useQueryClient();

  const mutation = useMutation(
    (riskSignalId: string) => decryptRiskSignalAmlHits({ authHeaders, entityId, riskSignalId }),
    {
      onSuccess: (response, riskSignalId: string) => {
        queryClient.setQueryData(['entity', entityId, 'risk-signals', riskSignalId, 'aml-hits'], response);
      },
    },
  );

  return mutation;
};

export default useRiskSignalAmlHits;
