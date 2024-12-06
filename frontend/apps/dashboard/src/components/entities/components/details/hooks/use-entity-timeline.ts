import useEntity from '@/entity/hooks/use-entity';
import {
  getEntitiesByFpIdBusinessOwnersOptions,
  getEntitiesByFpIdTimelineOptions,
} from '@onefootprint/axios/dashboard';
import type { GetEntitiesByFpIdTimelineData } from '@onefootprint/request-types/dashboard';
import { EntityStatus, type TimelineEvent, TimelineEventKind } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';

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

const useEntityTimeline = (
  id: string,
  query?: GetEntitiesByFpIdTimelineData['query'],
  showAllWatchlistChecks?: boolean,
) => {
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
      query: { ...query, pageSize: 100 },
    }),
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    select: (response: any) => {
      let allEvents;
      // TODO: migrate to expect only the modern paginated API repsonse
      if (Array.isArray(response)) {
        // For legacy API response
        allEvents = response as TimelineEvent[];
      } else {
        // For modern API response
        allEvents = response.data as TimelineEvent[];
      }

      const events = showAllWatchlistChecks ? allEvents : onlyFirstWatchlistCheck(allEvents);

      // Add in incomplete events
      const extraEvents: ExtraTimelineEvents[] = [];
      if (entity.data?.status === EntityStatus.incomplete && !showAllWatchlistChecks) {
        const hasPendingBos = bosQuery.data?.some(bo => {
          const isIncomplete =
            bo.boStatus === 'incomplete' || bo.boStatus === 'awaiting_kyc' || bo.boStatus === 'pending';
          return bo.name && isIncomplete;
        });
        extraEvents.push({
          event: {
            kind: hasPendingBos ? 'awaiting-bos' : 'abandoned',
            data: {},
          },
          seqno: events[0].seqno,
          timestamp: events[0].timestamp,
        });
      }

      return [...extraEvents, ...events];
    },
    enabled: (!!id && !isBusiness) || (!!id && isBusiness && !!bosQuery.data),
  });
};

/** Filter out all except the very first watchlist check event. All others will be rendered in a drawer */
const onlyFirstWatchlistCheck = (allEvents: TimelineEvent[]) => {
  const events: TimelineEvent[] = [];
  allEvents.forEach(event => {
    const isWatchlistCheck = event.event.kind === TimelineEventKind.watchlistCheck;
    const alreadyHasWatchlistCheck = events.some(e => e.event.kind === TimelineEventKind.watchlistCheck);
    if (isWatchlistCheck && alreadyHasWatchlistCheck) {
      // Skip all but the first watchlist check event
      return;
    }
    events.push(event);
  });
  return events;
};

export default useEntityTimeline;
