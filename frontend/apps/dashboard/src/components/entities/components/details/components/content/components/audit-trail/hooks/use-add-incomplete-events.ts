import { getEntitiesByFpIdBusinessOwnersOptions } from '@onefootprint/axios/dashboard';
import { type Entity, EntityKind, EntityStatus, type TimelineEvent } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';

export type AbandonedEvent = {
  kind: 'abandoned';
  data: {};
};

export type AwaitingBosEvent = {
  kind: 'awaiting-bos';
  data: {};
};

/** Extra timeline event types that aren't returned by the backend. These are only added by the frontend */
export type ExtraTimelineEvents = {
  event: AbandonedEvent | AwaitingBosEvent;
  timestamp: string;
  seqno: number;
};

export type AuditTrailTimelineEvent = TimelineEvent | ExtraTimelineEvents;

/** Prefixes the timeline with events indicating when the entity's onboarding is incomplete, if needed. */
const useAddIncompleteEvents = (timeline: TimelineEvent[], entity: Entity): AuditTrailTimelineEvent[] => {
  const bosQuery = useQuery({
    ...getEntitiesByFpIdBusinessOwnersOptions({
      path: { fpId: entity.id },
    }),
    enabled: entity.kind === EntityKind.business,
  });

  const incompleteEvents: ExtraTimelineEvents[] = [];
  // Add in incomplete events
  if (entity.status === EntityStatus.incomplete && timeline.length > 0) {
    const hasPendingBos = bosQuery.data?.some(bo => {
      const isIncomplete = bo.boStatus === 'incomplete' || bo.boStatus === 'awaiting_kyc' || bo.boStatus === 'pending';
      return bo.name && isIncomplete;
    });
    incompleteEvents.push({
      event: {
        kind: hasPendingBos ? 'awaiting-bos' : 'abandoned',
        data: {},
      },
      seqno: timeline[0].seqno,
      timestamp: timeline[0].timestamp,
    });
  }

  return [...incompleteEvents, ...timeline];
};

export default useAddIncompleteEvents;
