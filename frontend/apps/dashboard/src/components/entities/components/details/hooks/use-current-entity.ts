import useEntity from './use-entity';
import useEntityId from './use-entity-id';

const useCurrentEntity = () => {
  const id = useEntityId();
  return useEntity(id);
};

export default useCurrentEntity;
