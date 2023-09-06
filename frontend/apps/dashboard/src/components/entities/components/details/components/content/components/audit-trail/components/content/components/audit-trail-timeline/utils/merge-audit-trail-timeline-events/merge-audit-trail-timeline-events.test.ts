import type { TimelineEvent, WatchlistCheckEvent } from '@onefootprint/types';
import {
  CollectedKycDataOption,
  IdDocStatus,
  SupportedIdDocTypes,
  TimelineEventKind,
  WatchlistCheckReasonCode,
  WatchlistCheckStatus,
} from '@onefootprint/types';

import mergeAuditTrailTimelineEvents from './merge-audit-trail-timeline-events';

const watchlistCheckEvent1: WatchlistCheckEvent = {
  kind: TimelineEventKind.watchlistCheck,
  data: {
    id: 'wc_P9YiE099FMKTAY7Ku5Qxdc',
    reasonCodes: [WatchlistCheckReasonCode.watchlistHitOfac],
    status: WatchlistCheckStatus.fail,
  },
};
const watchlistCheckEvent2: WatchlistCheckEvent = {
  kind: TimelineEventKind.watchlistCheck,
  data: {
    id: 'wc_P9YiE099FMKTAY7Ku5Qxdc',
    reasonCodes: [WatchlistCheckReasonCode.watchlistHitOfac],
    status: WatchlistCheckStatus.error,
  },
};

const watchlistCheckEvent3: WatchlistCheckEvent = {
  kind: TimelineEventKind.watchlistCheck,
  data: {
    id: 'wc_P9YiE099FMKTAY7Ku5Qxdc',
    reasonCodes: [WatchlistCheckReasonCode.watchlistHitOfac],
    status: WatchlistCheckStatus.pass,
  },
};

describe('mergeAuditTrailTimelineEvents', () => {
  it('when events are empty, should return empty array', () => {
    const events: TimelineEvent[] = [];
    const result = mergeAuditTrailTimelineEvents(events);
    expect(result).toEqual([]);
  });

  describe('Merging when there is no watchlist event in the timeline', () => {
    it('does not merge events if isFromOtherOrg is false', () => {
      const events: TimelineEvent[] = [
        {
          event: {
            kind: TimelineEventKind.dataCollected,
            data: {
              attributes: [CollectedKycDataOption.dob],
            },
          },
          isFromOtherOrg: false,
          timestamp: '2021-01-01T00:00:00.000Z',
        },
        {
          event: {
            kind: TimelineEventKind.dataCollected,
            data: {
              attributes: [CollectedKycDataOption.email],
            },
          },
          isFromOtherOrg: false,
          timestamp: '2021-02-02T00:00:00.000Z',
        },
      ];
      const result = mergeAuditTrailTimelineEvents(events);
      expect(result).toEqual([
        {
          event: {
            kind: TimelineEventKind.dataCollected,
            data: {
              attributes: [CollectedKycDataOption.dob],
            },
          },
          isFromOtherOrg: false,
          time: { timestamp: '2021-01-01T00:00:00.000Z' },
        },
        {
          event: {
            kind: TimelineEventKind.dataCollected,
            data: {
              attributes: [CollectedKycDataOption.email],
            },
          },
          isFromOtherOrg: false,
          time: { timestamp: '2021-02-02T00:00:00.000Z' },
        },
      ]);
    });

    it('should not merge events when kind is not kycDataCollected', () => {
      const events: TimelineEvent[] = [
        {
          event: {
            kind: TimelineEventKind.idDocUploaded,
            data: {
              status: IdDocStatus.complete,
              documentType: SupportedIdDocTypes.driversLicense,
              selfieCollected: true,
            },
          },
          isFromOtherOrg: false,
          timestamp: '2021-01-01T00:00:00.000Z',
        },
        {
          event: {
            kind: TimelineEventKind.idDocUploaded,
            data: {
              status: IdDocStatus.complete,
              documentType: SupportedIdDocTypes.passport,
              selfieCollected: true,
            },
          },
          isFromOtherOrg: false,
          timestamp: '2021-02-02T00:00:00.000Z',
        },
      ];
      const result = mergeAuditTrailTimelineEvents(events);
      expect(result).toEqual([
        {
          event: {
            kind: TimelineEventKind.idDocUploaded,
            data: {
              status: IdDocStatus.complete,
              documentType: SupportedIdDocTypes.driversLicense,
              selfieCollected: true,
            },
          },
          isFromOtherOrg: false,
          time: { timestamp: '2021-01-01T00:00:00.000Z' },
        },
        {
          event: {
            kind: TimelineEventKind.idDocUploaded,
            data: {
              status: IdDocStatus.complete,
              documentType: SupportedIdDocTypes.passport,
              selfieCollected: true,
            },
          },
          isFromOtherOrg: false,
          time: { timestamp: '2021-02-02T00:00:00.000Z' },
        },
      ]);
    });

    it('merges events correctly', () => {
      const events: TimelineEvent[] = [
        {
          event: {
            kind: TimelineEventKind.dataCollected,
            data: {
              attributes: [CollectedKycDataOption.dob],
            },
          },
          isFromOtherOrg: true,
          timestamp: '2021-01-01T00:00:00.000Z',
        },
        {
          event: {
            kind: TimelineEventKind.dataCollected,
            data: {
              attributes: [CollectedKycDataOption.email],
            },
          },
          isFromOtherOrg: true,
          timestamp: '2021-02-02T00:00:00.000Z',
        },
        {
          event: {
            kind: TimelineEventKind.dataCollected,
            data: {
              attributes: [CollectedKycDataOption.address],
            },
          },
          isFromOtherOrg: true,
          timestamp: '2021-03-03T00:00:00.000Z',
        },
      ];
      const result = mergeAuditTrailTimelineEvents(events);
      expect(result).toEqual([
        {
          event: {
            kind: TimelineEventKind.dataCollected,
            data: {
              attributes: [
                CollectedKycDataOption.dob,
                CollectedKycDataOption.email,
                CollectedKycDataOption.address,
              ],
            },
          },
          isFromOtherOrg: true,
          time: {
            start: '2021-01-01T00:00:00.000Z',
            end: '2021-03-03T00:00:00.000Z',
          },
        },
      ]);
    });

    it('stops merge if event is not from other org', () => {
      const events: TimelineEvent[] = [
        {
          event: {
            kind: TimelineEventKind.dataCollected,
            data: {
              attributes: [CollectedKycDataOption.dob],
            },
          },
          isFromOtherOrg: true,
          timestamp: '2021-01-01T00:00:00.000Z',
        },
        {
          event: {
            kind: TimelineEventKind.dataCollected,
            data: {
              attributes: [CollectedKycDataOption.email],
            },
          },
          isFromOtherOrg: true,
          timestamp: '2021-02-02T00:00:00.000Z',
        },
        {
          event: {
            kind: TimelineEventKind.idDocUploaded,
            data: {
              status: IdDocStatus.complete,
              documentType: SupportedIdDocTypes.driversLicense,
              selfieCollected: true,
            },
          },
          isFromOtherOrg: false,
          timestamp: '2021-02-02T00:00:00.000Z',
        },
        {
          event: {
            kind: TimelineEventKind.dataCollected,
            data: {
              attributes: [CollectedKycDataOption.address],
            },
          },
          isFromOtherOrg: true,
          timestamp: '2021-03-03T00:00:00.000Z',
        },
      ];
      const result = mergeAuditTrailTimelineEvents(events);
      expect(result).toEqual([
        {
          event: {
            kind: TimelineEventKind.dataCollected,
            data: {
              attributes: [
                CollectedKycDataOption.dob,
                CollectedKycDataOption.email,
              ],
            },
          },
          isFromOtherOrg: true,
          time: {
            start: '2021-01-01T00:00:00.000Z',
            end: '2021-02-02T00:00:00.000Z',
          },
        },
        {
          event: {
            kind: TimelineEventKind.idDocUploaded,
            data: {
              status: IdDocStatus.complete,
              documentType: SupportedIdDocTypes.driversLicense,
              selfieCollected: true,
            },
          },
          isFromOtherOrg: false,
          time: { timestamp: '2021-02-02T00:00:00.000Z' },
        },
        {
          event: {
            kind: TimelineEventKind.dataCollected,
            data: {
              attributes: [CollectedKycDataOption.address],
            },
          },
          isFromOtherOrg: true,
          time: { timestamp: '2021-03-03T00:00:00.000Z' },
        },
      ]);
    });
  });

  describe('Watchlist event grouping', () => {
    it('groups when there is only one watchlist event, and no other events', () => {
      const events: TimelineEvent[] = [
        {
          event: watchlistCheckEvent1,
          isFromOtherOrg: false,
          timestamp: '2021-01-01T00:00:00.000Z',
        },
      ];
      const result = mergeAuditTrailTimelineEvents(events);
      expect(result).toEqual([
        {
          event: {
            kind: TimelineEventKind.combinedWatchlistChecks,
            data: [],
            latestWatchlistEvent: watchlistCheckEvent1,
          },
          isFromOtherOrg: false,
          time: { timestamp: '2021-01-01T00:00:00.000Z' },
        },
      ]);
    });

    it('groups multiple watchlist events correctly, when there are no other events', () => {
      const events: TimelineEvent[] = [
        {
          event: watchlistCheckEvent1,
          isFromOtherOrg: false,
          timestamp: '2021-01-01T00:00:00.000Z',
        },
        {
          event: watchlistCheckEvent2,
          isFromOtherOrg: false,
          timestamp: '2021-01-02T00:00:00.000Z',
        },
      ];
      const result = mergeAuditTrailTimelineEvents(events);
      expect(result).toEqual([
        {
          event: {
            kind: TimelineEventKind.combinedWatchlistChecks,
            data: [
              {
                watchlistEvent: watchlistCheckEvent1,
                timestamp: '2021-01-01T00:00:00.000Z',
              },
            ],
            latestWatchlistEvent: watchlistCheckEvent2,
          },
          isFromOtherOrg: false,
          time: { timestamp: '2021-01-02T00:00:00.000Z' },
        },
      ]);
    });

    it('groups multiple watchlist events correctly, when there are other events present', () => {
      const events: TimelineEvent[] = [
        {
          event: watchlistCheckEvent1,
          isFromOtherOrg: false,
          timestamp: '2021-01-01T00:00:00.000Z',
        },
        {
          event: {
            kind: TimelineEventKind.dataCollected,
            data: {
              attributes: [CollectedKycDataOption.dob],
            },
          },
          isFromOtherOrg: false,
          timestamp: '2021-01-02T00:00:00.000Z',
        },
        {
          event: {
            kind: TimelineEventKind.dataCollected,
            data: {
              attributes: [CollectedKycDataOption.email],
            },
          },
          isFromOtherOrg: false,
          timestamp: '2021-01-03T00:00:00.000Z',
        },
        {
          event: watchlistCheckEvent2,
          isFromOtherOrg: false,
          timestamp: '2021-01-04T00:00:00.000Z',
        },
        {
          event: watchlistCheckEvent3,
          isFromOtherOrg: false,
          timestamp: '2021-01-05T00:00:00.000Z',
        },
        {
          event: {
            kind: TimelineEventKind.dataCollected,
            data: {
              attributes: [CollectedKycDataOption.address],
            },
          },
          isFromOtherOrg: false,
          timestamp: '2021-01-06T00:00:00.000Z',
        },
      ];
      const result = mergeAuditTrailTimelineEvents(events);
      expect(result).toEqual([
        {
          event: {
            kind: TimelineEventKind.dataCollected,
            data: {
              attributes: [CollectedKycDataOption.dob],
            },
          },
          isFromOtherOrg: false,
          time: { timestamp: '2021-01-02T00:00:00.000Z' },
        },
        {
          event: {
            kind: TimelineEventKind.dataCollected,
            data: {
              attributes: [CollectedKycDataOption.email],
            },
          },
          isFromOtherOrg: false,
          time: { timestamp: '2021-01-03T00:00:00.000Z' },
        },
        {
          event: {
            kind: TimelineEventKind.combinedWatchlistChecks,
            data: [
              {
                watchlistEvent: watchlistCheckEvent1,
                timestamp: '2021-01-01T00:00:00.000Z',
              },
              {
                watchlistEvent: watchlistCheckEvent2,
                timestamp: '2021-01-04T00:00:00.000Z',
              },
            ],
            latestWatchlistEvent: watchlistCheckEvent3,
          },
          isFromOtherOrg: false,
          time: { timestamp: '2021-01-05T00:00:00.000Z' },
        },
        {
          event: {
            kind: TimelineEventKind.dataCollected,
            data: {
              attributes: [CollectedKycDataOption.address],
            },
          },
          isFromOtherOrg: false,
          time: { timestamp: '2021-01-06T00:00:00.000Z' },
        },
      ]);
    });
  });

  describe('watchlist event grouping and data collected events merging together', () => {
    it('merges data collected events correctly and groups watchlist events correctly', () => {
      const events: TimelineEvent[] = [
        {
          event: {
            kind: TimelineEventKind.dataCollected,
            data: {
              attributes: [CollectedKycDataOption.dob],
            },
          },
          isFromOtherOrg: true,
          timestamp: '2021-01-01T00:00:00.000Z',
        },
        {
          event: watchlistCheckEvent1,
          isFromOtherOrg: false,
          timestamp: '2021-02-02T00:00:00.000Z',
        },
        {
          event: watchlistCheckEvent2,
          isFromOtherOrg: false,
          timestamp: '2021-03-03T00:00:00.000Z',
        },
        {
          event: {
            kind: TimelineEventKind.dataCollected,
            data: {
              attributes: [CollectedKycDataOption.email],
            },
          },
          isFromOtherOrg: true,
          timestamp: '2021-04-04T00:00:00.000Z',
        },
        {
          event: {
            kind: TimelineEventKind.dataCollected,
            data: {
              attributes: [CollectedKycDataOption.address],
            },
          },
          isFromOtherOrg: true,
          timestamp: '2021-05-05T00:00:00.000Z',
        },
        {
          event: watchlistCheckEvent3,
          isFromOtherOrg: false,
          timestamp: '2021-06-06T00:00:00.000Z',
        },
      ];
      const result = mergeAuditTrailTimelineEvents(events);
      expect(result).toEqual([
        {
          event: {
            kind: TimelineEventKind.dataCollected,
            data: {
              attributes: [CollectedKycDataOption.dob],
            },
          },
          isFromOtherOrg: true,
          time: { timestamp: '2021-01-01T00:00:00.000Z' },
        },
        {
          event: {
            kind: TimelineEventKind.dataCollected,
            data: {
              attributes: [
                CollectedKycDataOption.email,
                CollectedKycDataOption.address,
              ],
            },
          },
          isFromOtherOrg: true,
          time: {
            start: '2021-04-04T00:00:00.000Z',
            end: '2021-05-05T00:00:00.000Z',
          },
        },
        {
          event: {
            kind: TimelineEventKind.combinedWatchlistChecks,
            data: [
              {
                watchlistEvent: watchlistCheckEvent1,
                timestamp: '2021-02-02T00:00:00.000Z',
              },
              {
                watchlistEvent: watchlistCheckEvent2,
                timestamp: '2021-03-03T00:00:00.000Z',
              },
            ],
            latestWatchlistEvent: watchlistCheckEvent3,
          },
          isFromOtherOrg: false,
          time: { timestamp: '2021-06-06T00:00:00.000Z' },
        },
      ]);
    });
  });
});
