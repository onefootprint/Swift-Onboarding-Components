import type { CombinedWatchlistChecksEvent, TimelineEvent, WatchlistCheckEvent } from '@onefootprint/types';
import { TimelineEventKind } from '@onefootprint/types';

export type AuditTrailTimelineEvent = TimelineEvent;

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
  const latestWatchlistEventSeqno =
    combinedWatchlistChecksEvent.data.length > 0 ? combinedWatchlistChecksEvent.data[0].seqno : event.seqno;

  combinedWatchlistChecksEvent.data.push({
    watchlistEvent: currentWatchlistEvent,
    timestamp: event.timestamp,
    seqno: event.seqno,
  });
  const newCombinedWatchlistCheckEvent = {
    ...combinedWatchlistChecksEvent,
    latestWatchlistEvent,
  };

  const newTimelineWatchlishEvent: AuditTrailTimelineEvent = {
    event: {
      ...newCombinedWatchlistCheckEvent,
    },
    timestamp: latestWatchlistEventTimestamp,
    seqno: latestWatchlistEventSeqno,
  };
  const newBufferTimeline = [...bufferTimeline];
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
      timestamp: event.timestamp,
      seqno: event.seqno,
    });
  });

  return bufferTimeline;
};

export default mergeAuditTrailTimelineEvents;
