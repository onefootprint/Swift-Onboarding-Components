import { useMutation, useQueryClient } from '@tanstack/react-query';
import useSession from 'src/hooks/use-session';

import useEntityId from '@/entity/hooks/use-entity-id';
import { postEntitiesByFpIdDecryptAmlHitsBySignalIdMutation } from '@onefootprint/axios/dashboard/@tanstack/react-query.gen';

const useRiskSignalAmlHits = () => {
  const { authHeaders } = useSession();
  const entityId = useEntityId();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    ...postEntitiesByFpIdDecryptAmlHitsBySignalIdMutation({
      headers: { 'X-Fp-Dashboard-Authorization': authHeaders['x-fp-dashboard-authorization'] },
    }),
    onSuccess: (response, options) => {
      const riskSignalId = options.path.signalId;
      queryClient.setQueryData(['entity', entityId, 'risk-signals', riskSignalId, 'aml-hits'], response);
    },
  });

  return mutation;
};

export default useRiskSignalAmlHits;
