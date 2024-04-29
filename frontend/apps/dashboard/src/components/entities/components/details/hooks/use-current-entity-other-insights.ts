import useEntityId from './use-entity-id';
import useEntityOtherInsights from './use-entity-other-insights';

const useCurrentEntityOtherInsights = () => {
  const id = useEntityId();
  return useEntityOtherInsights(id);
};

export default useCurrentEntityOtherInsights;
