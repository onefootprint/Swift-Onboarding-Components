import { getErrorMessage } from '@onefootprint/request';

import useEntityId from './use-entity-id';
import useEntityRiskSignals from './use-entity-risk-signals';

const useCurrentEntityRiskSignals = () => {
  const id = useEntityId();
  const query = useEntityRiskSignals(id);
  const { error } = query;
  return {
    ...query,
    errorMessage: error ? getErrorMessage(error) : undefined,
  };
};

export default useCurrentEntityRiskSignals;
