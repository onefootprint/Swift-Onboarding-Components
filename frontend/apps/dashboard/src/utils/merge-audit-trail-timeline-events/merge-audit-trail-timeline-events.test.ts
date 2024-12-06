import type { TimelineEvent, WatchlistCheckEvent } from '@onefootprint/types';
import {
  CollectedKycDataOption,
  DocumentRequestKind,
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
    it('does not merge non-watchlist events', () => {
      const events: TimelineEvent[] = [
        {
          event: {
            kind: TimelineEventKind.dataCollected,
            data: {
              attributes: [CollectedKycDataOption.dob],
              isPrefill: false,
            },
          },
          timestamp: '2021-01-02T00:00:00.000Z',
          seqno: 2,
        },
        {
          event: {
            kind: TimelineEventKind.dataCollected,
            data: {
              attributes: [CollectedKycDataOption.email],
              isPrefill: false,
            },
          },
          timestamp: '2021-02-01T00:00:00.000Z',
          seqno: 1,
        },
      ];
      const result = mergeAuditTrailTimelineEvents(events);
      expect(result).toEqual([
        {
          event: {
            kind: TimelineEventKind.dataCollected,
            data: {
              attributes: [CollectedKycDataOption.dob],
              isPrefill: false,
            },
          },
          timestamp: '2021-01-02T00:00:00.000Z',
          seqno: 2,
        },
        {
          event: {
            kind: TimelineEventKind.dataCollected,
            data: {
              attributes: [CollectedKycDataOption.email],
              isPrefill: false,
            },
          },
          timestamp: '2021-02-01T00:00:00.000Z',
          seqno: 1,
        },
      ]);
    });

    it('should also not merge events when kind is not kycDataCollected', () => {
      const events: TimelineEvent[] = [
        {
          event: {
            kind: TimelineEventKind.documentUploaded,
            data: {
              status: IdDocStatus.complete,
              documentType: SupportedIdDocTypes.driversLicense,
              config: {
                kind: DocumentRequestKind.Identity,
                data: {
                  collectSelfie: true,
                },
              },
            },
          },
          timestamp: '2021-01-02T00:00:00.000Z',
          seqno: 3,
        },
        {
          event: {
            kind: TimelineEventKind.documentUploaded,
            data: {
              status: IdDocStatus.complete,
              documentType: SupportedIdDocTypes.passport,
              config: {
                kind: DocumentRequestKind.Identity,
                data: {
                  collectSelfie: true,
                },
              },
            },
          },
          timestamp: '2021-02-01T00:00:00.000Z',
          seqno: 4,
        },
      ];
      const result = mergeAuditTrailTimelineEvents(events);
      expect(result).toEqual([
        {
          event: {
            kind: TimelineEventKind.documentUploaded,
            data: {
              status: IdDocStatus.complete,
              documentType: SupportedIdDocTypes.driversLicense,
              config: {
                kind: DocumentRequestKind.Identity,
                data: {
                  collectSelfie: true,
                },
              },
            },
          },
          timestamp: '2021-01-02T00:00:00.000Z',
          seqno: 3,
        },
        {
          event: {
            kind: TimelineEventKind.documentUploaded,
            data: {
              status: IdDocStatus.complete,
              documentType: SupportedIdDocTypes.passport,
              config: {
                kind: DocumentRequestKind.Identity,
                data: {
                  collectSelfie: true,
                },
              },
            },
          },
          timestamp: '2021-02-01T00:00:00.000Z',
          seqno: 4,
        },
      ]);
    });
  });

  describe('Watchlist event grouping', () => {
    it('groups when there is only one watchlist event, and no other events', () => {
      const events: TimelineEvent[] = [
        {
          event: watchlistCheckEvent1,
          timestamp: '2021-01-01T00:00:00.000Z',
          seqno: 1,
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
                seqno: 1,
              },
            ],
            latestWatchlistEvent: watchlistCheckEvent1,
          },
          timestamp: '2021-01-01T00:00:00.000Z',
          seqno: 1,
        },
      ]);
    });

    it('groups multiple watchlist events correctly, when there are no other events', () => {
      const events: TimelineEvent[] = [
        {
          event: watchlistCheckEvent1,
          timestamp: '2021-01-02T00:00:00.000Z',
          seqno: 2,
        },
        {
          event: watchlistCheckEvent2,
          timestamp: '2021-01-01T00:00:00.000Z',
          seqno: 1,
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
                timestamp: '2021-01-02T00:00:00.000Z',
                seqno: 2,
              },
              {
                watchlistEvent: watchlistCheckEvent2,
                timestamp: '2021-01-01T00:00:00.000Z',
                seqno: 1,
              },
            ],
            latestWatchlistEvent: watchlistCheckEvent1,
          },
          timestamp: '2021-01-02T00:00:00.000Z',
          seqno: 2,
        },
      ]);
    });

    it('groups multiple watchlist events correctly, when there are other events present', () => {
      const events: TimelineEvent[] = [
        {
          event: watchlistCheckEvent1,
          timestamp: '2021-01-06T00:00:00.000Z',
          seqno: 6,
        },
        {
          event: {
            kind: TimelineEventKind.dataCollected,
            data: {
              attributes: [CollectedKycDataOption.dob],
              isPrefill: false,
            },
          },
          timestamp: '2021-01-05T00:00:00.000Z',
          seqno: 5,
        },
        {
          event: {
            kind: TimelineEventKind.dataCollected,
            data: {
              attributes: [CollectedKycDataOption.email],
              isPrefill: false,
            },
          },
          timestamp: '2021-01-04T00:00:00.000Z',
          seqno: 4,
        },
        {
          event: watchlistCheckEvent2,
          timestamp: '2021-01-03T00:00:00.000Z',
          seqno: 3,
        },
        {
          event: watchlistCheckEvent3,
          timestamp: '2021-01-02T00:00:00.000Z',
          seqno: 2,
        },
        {
          event: {
            kind: TimelineEventKind.dataCollected,
            data: {
              attributes: [CollectedKycDataOption.address],
              isPrefill: false,
            },
          },
          timestamp: '2021-01-01T00:00:00.000Z',
          seqno: 1,
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
                timestamp: '2021-01-06T00:00:00.000Z',
                seqno: 6,
              },
              {
                watchlistEvent: watchlistCheckEvent2,
                timestamp: '2021-01-03T00:00:00.000Z',
                seqno: 3,
              },
              {
                watchlistEvent: watchlistCheckEvent3,
                timestamp: '2021-01-02T00:00:00.000Z',
                seqno: 2,
              },
            ],
            latestWatchlistEvent: watchlistCheckEvent1,
          },
          timestamp: '2021-01-06T00:00:00.000Z',
          seqno: 6,
        },
        {
          event: {
            kind: TimelineEventKind.dataCollected,
            data: {
              attributes: [CollectedKycDataOption.dob],
              isPrefill: false,
            },
          },
          timestamp: '2021-01-05T00:00:00.000Z',
          seqno: 5,
        },
        {
          event: {
            kind: TimelineEventKind.dataCollected,
            data: {
              attributes: [CollectedKycDataOption.email],
              isPrefill: false,
            },
          },
          timestamp: '2021-01-04T00:00:00.000Z',
          seqno: 4,
        },
        {
          event: {
            kind: TimelineEventKind.dataCollected,
            data: {
              attributes: [CollectedKycDataOption.address],
              isPrefill: false,
            },
          },
          timestamp: '2021-01-01T00:00:00.000Z',
          seqno: 1,
        },
      ]);
    });
  });
});
