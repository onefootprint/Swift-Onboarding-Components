import useEntityVault from '../../../hooks/use-entity-vault';
import useEntity from './use-entity';
import useEntityId from './use-entity-id';
import useEntityLiveness from './use-entity-liveness';
import useEntityRiskSignals from './use-entity-risk-signals';
import useEntityTimeline from './use-entity-timeline';

const useEntityInitialData = () => {
  const id = useEntityId();
  const entityQuery = useEntity(id);
  const entityTimelineQuery = useEntityTimeline(id);
  const entityVaultQuery = useEntityVault(id, entityQuery.data);
  const entityRiskSignalsQuery = useEntityRiskSignals(id);
  const entityLivenessQuery = useEntityLiveness(id);
  const isLoadingVault = entityVaultQuery.isLoading && !entityQuery.isError;

  return {
    ...entityQuery,
    isLoading:
      entityQuery.isLoading ||
      entityTimelineQuery.isLoading ||
      entityRiskSignalsQuery.isLoading ||
      entityLivenessQuery.isLoading ||
      isLoadingVault,
  };
};

export default useEntityInitialData;
