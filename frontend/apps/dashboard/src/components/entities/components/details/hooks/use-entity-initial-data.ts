import useEntityVaultWithTransforms from '../../../hooks/use-entity-vault-with-transforms';
import useEntity from './use-entity';
import useEntityAnnotations from './use-entity-annotations';
import useEntityLiveness from './use-entity-auth-events';
import useEntityId from './use-entity-id';
import useEntityOtherInsights from './use-entity-other-insights';
import useEntityRiskSignals from './use-entity-risk-signals';
import useEntityTimeline from './use-entity-timeline';

const useEntityInitialData = () => {
  const id = useEntityId();
  const entityQuery = useEntity(id);
  const entityTimelineQuery = useEntityTimeline(id);
  const entityVaultQuery = useEntityVaultWithTransforms(id, entityQuery.data);
  const entityRiskSignalsQuery = useEntityRiskSignals(id);
  const entityLivenessQuery = useEntityLiveness(id);
  const entityAnnotations = useEntityAnnotations(id);
  const entityOtherInsights = useEntityOtherInsights(id);
  const isLoadingVault = entityVaultQuery.isLoading && !entityQuery.isError;

  return {
    ...entityQuery,
    isLoading:
      entityQuery.isLoading ||
      entityTimelineQuery.isLoading ||
      entityRiskSignalsQuery.isLoading ||
      entityLivenessQuery.isLoading ||
      entityAnnotations.isLoading ||
      entityOtherInsights.isLoading ||
      isLoadingVault,
  };
};

export default useEntityInitialData;
