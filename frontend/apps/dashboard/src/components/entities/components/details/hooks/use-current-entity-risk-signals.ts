import useEntityId from './use-entity-id';
import useEntityRiskSignals from './use-entity-risk-signals';
import useEntitySeqno from './use-entity-seqno';

const useCurrentEntityRiskSignals = () => {
  const id = useEntityId();
  const seqno = useEntitySeqno();
  return useEntityRiskSignals(id, seqno);
};

export default useCurrentEntityRiskSignals;
