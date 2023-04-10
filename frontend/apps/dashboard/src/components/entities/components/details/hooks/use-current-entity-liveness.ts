import useEntityId from './use-entity-id';
import useEntityLiveness from './use-entity-liveness';

const useCurrentEntityLiveness = () => {
  const id = useEntityId();
  return useEntityLiveness(id);
};

export default useCurrentEntityLiveness;
