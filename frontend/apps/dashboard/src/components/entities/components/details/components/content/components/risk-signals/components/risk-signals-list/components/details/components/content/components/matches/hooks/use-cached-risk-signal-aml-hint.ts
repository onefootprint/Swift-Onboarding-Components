import type { AmlDetail } from '@onefootprint/types';
import { useQueryClient } from '@tanstack/react-query';

import useEntityId from '@/entity/hooks/use-entity-id';

const useCachedRiskSignalAmlHint = (riskSignalId: string): AmlDetail | undefined => {
  const entityId = useEntityId();
  const queryClient = useQueryClient();

  return queryClient.getQueryData(['entity', entityId, 'risk-signals', riskSignalId, 'aml-hits']);
};

export default useCachedRiskSignalAmlHint;
