import useEntityAnnotations from './use-entity-annotations';
import useEntityId from './use-entity-id';

const useCurrentEntityAnnotations = () => {
  const id = useEntityId();
  return useEntityAnnotations(id);
};

export default useCurrentEntityAnnotations;
