import useEntityDuplicateData from './use-entity-duplicate-data';
import useEntityId from './use-entity-id';

const useCurrentEntityDuplicateData = () => {
  const id = useEntityId();
  return useEntityDuplicateData(id);
};

export default useCurrentEntityDuplicateData;
