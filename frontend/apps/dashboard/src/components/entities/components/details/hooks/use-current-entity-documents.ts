import useDocuments from './use-documents';
import useEntityId from './use-entity-id';
import useEntitySeqno from './use-entity-seqno';

const useCurrentEntityDocuments = () => {
  const id = useEntityId();
  const seqno = useEntitySeqno();
  return useDocuments(id, seqno);
};

export default useCurrentEntityDocuments;
