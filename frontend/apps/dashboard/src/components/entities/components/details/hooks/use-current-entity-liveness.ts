import { getErrorMessage } from '@onefootprint/request';

import useEntityId from './use-entity-id';
import useEntityLiveness from './use-entity-liveness';

const useCurrentEntityLiveness = () => {
  const id = useEntityId();
  const query = useEntityLiveness(id);
  const { error } = query;
  return {
    ...query,
    errorMessage: error ? getErrorMessage(error) : undefined,
  };
};

export default useCurrentEntityLiveness;
