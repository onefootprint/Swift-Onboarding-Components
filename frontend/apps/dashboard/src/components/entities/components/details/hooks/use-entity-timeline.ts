import useEntity from '@/entity/hooks/use-entity';
import {
  getEntitiesByFpIdBusinessOwnersOptions,
  getEntitiesByFpIdTimelineOptions,
} from '@onefootprint/axios/dashboard';
import { EntityStatus, type TimelineEvent, TimelineEventKind } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import mergeAuditTrailTimelineEvents from 'src/utils/merge-audit-trail-timeline-events';

const useEntityTimeline = (id: string) => {
  const router = useRouter();
  const isBusiness = router.pathname.includes('businesses');
  const entity = useEntity(id);
  const bosQuery = useQuery({
    ...getEntitiesByFpIdBusinessOwnersOptions({
      path: { fpId: id },
    }),
    enabled: isBusiness,
  });
  return useQuery({
    ...getEntitiesByFpIdTimelineOptions({
      path: { fpId: id },
      // @ts-expect-error: remove once backend is fixed
      query: {},
    }),
    select: events => {
      const mergedEvents = mergeAuditTrailTimelineEvents(events as TimelineEvent[]);

      if (entity.data?.status === EntityStatus.incomplete) {
        const hasPendingBos = bosQuery.data?.some(bo => {
          return bo.name && (bo.status === 'incomplete' || bo.status == null);
        });
        mergedEvents.unshift({
          event: {
            kind: hasPendingBos ? TimelineEventKind.awaitingBos : TimelineEventKind.abandoned,
            data: {},
          },
          seqno: events[0].seqno,
          time: events[0],
        });
      }
      return mergedEvents;
    },
    enabled: (!!id && !isBusiness) || (!!id && isBusiness && !!bosQuery.data),
  });
};

export default useEntityTimeline;
