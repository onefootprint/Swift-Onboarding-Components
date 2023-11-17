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
  combinedWatchlistEventIndex: number,
  currIndex: number,
) => {
  const currentWatchlistEvent = event.event as WatchlistCheckEvent;
  const latestWatchlistEvent =
    combinedWatchlistChecksEvent.latestWatchlistEvent ?? currentWatchlistEvent;
  const latestWatchlistEventTimestamp =
    combinedWatchlistChecksEvent.data.length > 0
      ? combinedWatchlistChecksEvent.data[0].timestamp
      : event.timestamp;
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
    isFromOtherOrg: event.isFromOtherOrg,
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
    combinedWatchlistEventIndex:
      combinedWatchlistEventIndex >= 0
        ? combinedWatchlistEventIndex
        : currIndex,
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
    // Use the last event time as the end time to create a range since we get the events in descending order
    lastEvent.time = {
      start: event.timestamp,
      end: lastEvent.time.timestamp,
    };
  } else {
    // Just update the start rage
    lastEvent.time.start = event.timestamp;
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
  let combinedWatchlistEventIndex = -1;
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
        combinedWatchlistEventIndex,
      } = processWatchlistEvent(
        combinedWatchlistChecksEvent,
        bufferTimeline,
        event,
        combinedWatchlistEventIndex,
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
