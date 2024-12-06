import { getEntitiesByFpIdTimeline } from '@onefootprint/axios/dashboard';
import type { GetEntitiesByFpIdTimelineData, UserTimeline } from '@onefootprint/request-types/dashboard';
import { type TimelineEvent, TimelineEventKind } from '@onefootprint/types';
import { useInfiniteQuery } from '@tanstack/react-query';
import useSession from 'src/hooks/use-session';

const useEntityTimeline = (
  id: string,
  query?: GetEntitiesByFpIdTimelineData['query'],
  showAllWatchlistChecks?: boolean,
) => {
  const { authHeaders } = useSession();
  const { data: infiniteQueryData, ...infiniteQuery } = useInfiniteQuery({
    queryKey: ['getEntitiesByFpIdTimeline', id, query, authHeaders],
    queryFn: async ({ pageParam }) => {
      const { data } = await getEntitiesByFpIdTimeline({
        path: { fpId: id },
        query: { ...query, cursor: pageParam, pageSize: 10 },
        headers: authHeaders as GetEntitiesByFpIdTimelineData['headers'],
      });
      return data;
    },
    getNextPageParam: lastPage => lastPage?.meta.next,
    initialPageParam: undefined as undefined | string,
    enabled: !!id,
  });

  // Only show the very first watchlist check event - all others will be rendered in a drawer
  const allEvents = infiniteQueryData?.pages.flatMap(page => page?.data ?? []);
  const data = showAllWatchlistChecks ? allEvents : onlyFirstWatchlistCheck(allEvents || []);

  return {
    ...infiniteQuery,
    data: data as TimelineEvent[],
  };
};

/** Filter out all except the very first watchlist check event. All others will be rendered in a drawer */
const onlyFirstWatchlistCheck = (allEvents: UserTimeline[]) => {
  const events: UserTimeline[] = [];
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
