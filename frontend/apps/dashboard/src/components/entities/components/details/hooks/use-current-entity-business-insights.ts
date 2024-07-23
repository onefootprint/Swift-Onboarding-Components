import useEntityBusinessInsights from './use-entity-business-insights';
import useEntityId from './use-entity-id';

const useCurrentEntityBusinessInsights = () => {
  const id = useEntityId();
  return useEntityBusinessInsights(id);
};

export default useCurrentEntityBusinessInsights;
