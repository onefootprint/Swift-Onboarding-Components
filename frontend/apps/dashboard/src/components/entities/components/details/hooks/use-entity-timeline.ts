import { getEntitiesByFpIdTimelineOptions } from '@onefootprint/axios/dashboard';
import type { GetEntitiesByFpIdTimelineData } from '@onefootprint/request-types/dashboard';
import { type TimelineEvent, TimelineEventKind } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';

const useEntityTimeline = (
  id: string,
  query?: GetEntitiesByFpIdTimelineData['query'],
  showAllWatchlistChecks?: boolean,
) => {
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

      return showAllWatchlistChecks ? allEvents : onlyFirstWatchlistCheck(allEvents);
    },
    enabled: !!id,
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
