import useEntity from '@/entity/hooks/use-entity';
import {
  getEntitiesByFpIdBusinessOwnersOptions,
  getEntitiesByFpIdTimelineOptions,
} from '@onefootprint/axios/dashboard';
import type { UserTimeline } from '@onefootprint/request-types/dashboard';
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
      query: { pageSize: 100 },
    }),
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    select: (response: any) => {
      let events;
      // TODO: migrate to expect only the modern paginated API repsonse
      if (Array.isArray(response)) {
        // For legacy API response
        events = response as UserTimeline[];
      } else {
        // For modern API response
        events = response.data as UserTimeline[];
      }
      const mergedEvents = mergeAuditTrailTimelineEvents(events as TimelineEvent[]);

      if (entity.data?.status === EntityStatus.incomplete) {
        const hasPendingBos = bosQuery.data?.some(bo => {
          const isIncomplete =
            bo.boStatus === 'incomplete' || bo.boStatus === 'awaiting_kyc' || bo.boStatus === 'pending';
          return bo.name && isIncomplete;
        });
        mergedEvents.unshift({
          event: {
            kind: hasPendingBos ? TimelineEventKind.awaitingBos : TimelineEventKind.abandoned,
            data: {},
          },
          seqno: events[0].seqno,
          timestamp: events[0].timestamp,
        });
      }
      return mergedEvents;
    },
    enabled: (!!id && !isBusiness) || (!!id && isBusiness && !!bosQuery.data),
  });
};

export default useEntityTimeline;
