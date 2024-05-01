import useDocuments from './use-documents';
import useEntityId from './use-entity-id';

const useCurrentEntityDocuments = () => {
  const id = useEntityId();
  return useDocuments(id);
};

export default useCurrentEntityDocuments;
