import useEntityId from './use-entity-id';
import useEntityRiskSignals from './use-entity-risk-signals';

const useCurrentEntityRiskSignals = () => {
  const id = useEntityId();
  return useEntityRiskSignals(id);
};

export default useCurrentEntityRiskSignals;
