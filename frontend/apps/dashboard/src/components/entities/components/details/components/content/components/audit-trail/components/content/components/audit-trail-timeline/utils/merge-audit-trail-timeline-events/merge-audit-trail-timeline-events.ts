import type { CombinedWatchlistChecksEvent, TimelineEvent, WatchlistCheckEvent } from '@onefootprint/types';
import { TimelineEventKind } from '@onefootprint/types';
import type { TimelineItemTimeData } from 'src/components/timeline';

export type AuditTrailTimelineEvent = Omit<TimelineEvent, 'timestamp'> & {
  time: TimelineItemTimeData;
};

const processWatchlistEvent = (
  combinedWatchlistChecksEvent: CombinedWatchlistChecksEvent,
  bufferTimeline: AuditTrailTimelineEvent[],
  event: TimelineEvent,
  combinedWatchlistEventIndex: number,
  currIndex: number,
) => {
  const currentWatchlistEvent = event.event as WatchlistCheckEvent;
  const latestWatchlistEvent = combinedWatchlistChecksEvent.latestWatchlistEvent ?? currentWatchlistEvent;
  const latestWatchlistEventTimestamp =
    combinedWatchlistChecksEvent.data.length > 0 ? combinedWatchlistChecksEvent.data[0].timestamp : event.timestamp;
  combinedWatchlistChecksEvent.data.push({
    watchlistEvent: currentWatchlistEvent,
    timestamp: event.timestamp,
  });
  const newCombinedWatchlistCheckEvent = {
    ...combinedWatchlistChecksEvent,
    latestWatchlistEvent,
  };
  const newBufferTimeline = [...bufferTimeline];
  const newTimelineWatchlishEvent: AuditTrailTimelineEvent = {
    event: {
      ...newCombinedWatchlistCheckEvent,
    },
    time: {
      timestamp: latestWatchlistEventTimestamp,
    },
  };

  if (combinedWatchlistEventIndex >= 0) {
    newBufferTimeline[combinedWatchlistEventIndex] = newTimelineWatchlishEvent;
  } else {
    newBufferTimeline.push(newTimelineWatchlishEvent);
  }

  return {
    combinedWatchlistChecksEvent: newCombinedWatchlistCheckEvent,
    bufferTimeline: newBufferTimeline,
    combinedWatchlistEventIndex: combinedWatchlistEventIndex >= 0 ? combinedWatchlistEventIndex : currIndex,
  };
};

const mergeAuditTrailTimelineEvents = (events: TimelineEvent[]): AuditTrailTimelineEvent[] => {
  let bufferTimeline: AuditTrailTimelineEvent[] = [];
  let combinedWatchlistEventIndex = -1;
  let combinedWatchlistChecksEvent: CombinedWatchlistChecksEvent = {
    kind: TimelineEventKind.combinedWatchlistChecks,
    latestWatchlistEvent: null,
    data: [],
  };
  events.forEach((event: TimelineEvent, i) => {
    if (event.event.kind === TimelineEventKind.watchlistCheck) {
      ({ combinedWatchlistChecksEvent, bufferTimeline, combinedWatchlistEventIndex } = processWatchlistEvent(
        combinedWatchlistChecksEvent,
        bufferTimeline,
        event,
        combinedWatchlistEventIndex,
        i,
      ));
      return;
    }

    bufferTimeline.push({
      event: event.event,
      time: {
        timestamp: event.timestamp,
      },
    });
  });

  return bufferTimeline;
};

export default mergeAuditTrailTimelineEvents;
