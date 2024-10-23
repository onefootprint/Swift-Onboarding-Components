import useLabel from 'src/hooks/use-label';
import useEntityVault from '../../../hooks/use-entity-vault';
import useRiskSignalsOverview from '../../../hooks/use-risk-signals-overview';
import useBusinessOwners from './use-business-owners';
import useCurrentEntity from './use-current-entity';
import useEntityAnnotations from './use-entity-annotations';
import useEntityLiveness from './use-entity-auth-events';
import useEntityId from './use-entity-id';
import useEntityOtherInsights from './use-entity-other-insights';
import useEntityOwnedBusinesses from './use-entity-owned-businesses';
import useEntityRiskSignals from './use-entity-risk-signals';
import useEntitySeqno from './use-entity-seqno';
import useEntityTags from './use-entity-tags';
import useEntityTimeline from './use-entity-timeline';

const useEntityInitialData = () => {
  const id = useEntityId();
  const seqno = useEntitySeqno();
  const entityQuery = useCurrentEntity();
  const entityTimelineQuery = useEntityTimeline(id);
  const entityVaultQuery = useEntityVault(id, entityQuery.data);
  const entityRiskSignalsQuery = useEntityRiskSignals(id, seqno);
  const entityLivenessQuery = useEntityLiveness(id);
  const entityAnnotations = useEntityAnnotations(id);
  const entityOtherInsights = useEntityOtherInsights(id);
  const entityOwnedBusinesses = useEntityOwnedBusinesses(id);
  const entityTags = useEntityTags(id);
  const businessOwners = useBusinessOwners(id);
  const fraudLabel = useLabel(id);
  const riskSignalsOverview = useRiskSignalsOverview(id, seqno);
  const isPendingVault = entityVaultQuery.isPending && !entityQuery.isError;

  return {
    ...entityQuery,
    isPending:
      entityQuery.isPending ||
      entityTimelineQuery.isPending ||
      entityRiskSignalsQuery.isPending ||
      entityLivenessQuery.isPending ||
      entityAnnotations.isPending ||
      entityOtherInsights.isPending ||
      entityOwnedBusinesses.isPending ||
      entityTags.isPending ||
      businessOwners.isPending ||
      fraudLabel.isPending ||
      riskSignalsOverview.isPending ||
      isPendingVault,
  };
};

export default useEntityInitialData;
