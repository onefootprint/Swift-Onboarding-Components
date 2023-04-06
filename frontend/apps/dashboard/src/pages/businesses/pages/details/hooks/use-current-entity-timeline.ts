import { getErrorMessage } from '@onefootprint/request';

import useEntityId from './use-entity-id';
import useEntityTimeline from './use-entity-timeline';

const useCurrentEntityTimeline = () => {
  const id = useEntityId();
  const query = useEntityTimeline(id);
  const { error } = query;
  return {
    ...query,
    errorMessage: error ? getErrorMessage(error) : undefined,
  };
};

export default useCurrentEntityTimeline;
