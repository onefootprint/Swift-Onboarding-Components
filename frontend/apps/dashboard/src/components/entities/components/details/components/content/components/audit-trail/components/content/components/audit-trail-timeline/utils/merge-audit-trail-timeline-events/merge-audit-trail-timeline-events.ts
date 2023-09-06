import type {
  CollectedDataEventData,
  CombinedWatchlistChecksEvent,
  TimelineEvent,
  WatchlistCheckEvent,
} from '@onefootprint/types';
import { TimelineEventKind } from '@onefootprint/types';
import type { TimelineItemTimeData } from 'src/components/timeline';

export type AuditTrailTimelineEvent = Omit<TimelineEvent, 'timestamp'> & {
  time: TimelineItemTimeData;
};

const processWatchlistEvent = (
  combinedWatchlistChecksEvent: CombinedWatchlistChecksEvent,
  bufferTimeline: (AuditTrailTimelineEvent | null)[],
  event: TimelineEvent,
  lastWatchlistEventIndex: number,
  currIndex: number,
) => {
  const currentWatchlistEvent = event.event as WatchlistCheckEvent;
  const newCombinedWatchlistCheckEvent = {
    ...combinedWatchlistChecksEvent,
    latestWatchlistEvent: currentWatchlistEvent,
  };
  const {
    kind: eventKind,
    latestWatchlistEvent: newLatestWatchlistEvent,
    data: updatedData,
  } = newCombinedWatchlistCheckEvent;
  const newBufferTimeline = [...bufferTimeline];
  newBufferTimeline.push({
    event: {
      kind: eventKind,
      latestWatchlistEvent: newLatestWatchlistEvent,
      data: [...updatedData],
    },
    isFromOtherOrg: event.isFromOtherOrg,
    time: {
      timestamp: event.timestamp,
    },
  });
  if (lastWatchlistEventIndex >= 0) {
    newBufferTimeline[lastWatchlistEventIndex] = null;
  }
  // Push to data after pushing to the tempTimeline so that the current check doesn't included in previous checks
  combinedWatchlistChecksEvent.data.push({
    watchlistEvent: currentWatchlistEvent,
    timestamp: event.timestamp,
  });
  const newLastWatchlistEventIndex = currIndex;
  return {
    combinedWatchlistChecksEvent: newCombinedWatchlistCheckEvent,
    bufferTimeline: newBufferTimeline,
    lastWatchlistEventIndex: newLastWatchlistEventIndex,
  };
};

const processNonWatchlistEvent = (
  event: TimelineEvent,
  bufferTimeline: (AuditTrailTimelineEvent | null)[],
) => {
  const isEventKycDataCollection =
    event.event.kind === TimelineEventKind.dataCollected;
  const lastEvent = bufferTimeline[bufferTimeline.length - 1];
  const isLastEventKycDataCollection =
    lastEvent?.event.kind === TimelineEventKind.dataCollected;
  if (
    // If the event is not from another tenant, or is not a kyc data collection event, add it as is
    !event.isFromOtherOrg ||
    !isEventKycDataCollection ||
    // If this is the first event, add it as is
    !bufferTimeline.length ||
    // If the previously added event is not a kyc data collection event, add the current event as is
    !lastEvent?.isFromOtherOrg ||
    !isLastEventKycDataCollection
  ) {
    bufferTimeline.push({
      event: event.event,
      isFromOtherOrg: event.isFromOtherOrg,
      time: {
        timestamp: event.timestamp,
      },
    });
    return;
  }
  // Merge times
  if ('timestamp' in lastEvent.time) {
    // Use the last event time as the start time to create a range
    lastEvent.time = {
      start: lastEvent.time.timestamp,
      end: event.timestamp,
    };
  } else {
    // Just update the end rage
    lastEvent.time.end = event.timestamp;
  }
  // Merge kyc data (id doc/selfie are not portable for now) & dedupe just in case
  const eventData = event.event.data as CollectedDataEventData;
  const lastEventData = lastEvent.event.data as CollectedDataEventData;
  const mergedAttributes = Array.from(
    new Set([...lastEventData.attributes, ...eventData.attributes]),
  );
  lastEventData.attributes = mergedAttributes;
};

const mergeAuditTrailTimelineEvents = (
  events: TimelineEvent[],
): AuditTrailTimelineEvent[] => {
  let bufferTimeline: (AuditTrailTimelineEvent | null)[] = [];
  let lastWatchlistEventIndex = -1;
  let combinedWatchlistChecksEvent: CombinedWatchlistChecksEvent = {
    kind: TimelineEventKind.combinedWatchlistChecks,
    latestWatchlistEvent: null,
    data: [],
  };
  events.forEach((event: TimelineEvent, i) => {
    if (event.event.kind === TimelineEventKind.watchlistCheck) {
      ({
        combinedWatchlistChecksEvent,
        bufferTimeline,
        lastWatchlistEventIndex,
      } = processWatchlistEvent(
        combinedWatchlistChecksEvent,
        bufferTimeline,
        event,
        lastWatchlistEventIndex,
        i,
      ));
      return;
    }

    processNonWatchlistEvent(event, bufferTimeline);
  });
  const mergedTimeline: AuditTrailTimelineEvent[] = bufferTimeline.filter(
    event => event !== null,
  ) as AuditTrailTimelineEvent[];

  return mergedTimeline;
};

export default mergeAuditTrailTimelineEvents;
