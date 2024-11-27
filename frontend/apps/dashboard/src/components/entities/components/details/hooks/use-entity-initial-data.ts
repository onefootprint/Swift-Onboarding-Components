import { useEntityContext } from '@/entity/hooks/use-entity-context';
import { getEntitiesByFpIdBusinessOwnersOptions } from '@onefootprint/axios/dashboard';
import { type Entity, EntityKind } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import useLabel from 'src/hooks/use-label';
import useEntityVault from '../../../hooks/use-entity-vault';
import useRiskSignalsOverview from '../../../hooks/use-risk-signals-overview';
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
  const { kind } = useEntityContext();
  const isBusiness = kind === EntityKind.business;
  const entityQuery = useCurrentEntity();
  const entityTimelineQuery = useEntityTimeline(id);
  // TODO: fix the types
  const entityVaultQuery = useEntityVault(id, entityQuery.data as Entity);
  const entityRiskSignalsQuery = useEntityRiskSignals(id, seqno);
  const entityLivenessQuery = useEntityLiveness(id);
  const entityAnnotations = useEntityAnnotations(id);
  const entityOtherInsights = useEntityOtherInsights(id);
  const entityOwnedBusinesses = useEntityOwnedBusinesses(id);
  const entityTags = useEntityTags(id);
  const fraudLabel = useLabel(id);
  const riskSignalsOverview = useRiskSignalsOverview(id, seqno);
  const bosQuery = useQuery({
    ...getEntitiesByFpIdBusinessOwnersOptions({
      path: { fpId: id },
    }),
    enabled: isBusiness,
  });

  return {
    ...entityQuery,
    isPending:
      (isBusiness ? bosQuery.isPending : false) ||
      (entityVaultQuery.isPending && !entityQuery.isError) ||
      entityQuery.isPending ||
      entityTimelineQuery.isPending ||
      entityRiskSignalsQuery.isPending ||
      entityLivenessQuery.isPending ||
      entityAnnotations.isPending ||
      entityOtherInsights.isPending ||
      entityOwnedBusinesses.isPending ||
      entityTags.isPending ||
      fraudLabel.isPending ||
      riskSignalsOverview.isPending,
  };
};

export default useEntityInitialData;
