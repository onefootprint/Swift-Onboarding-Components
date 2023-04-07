import {
  CollectedKycDataOption,
  DecryptedIdDocStatus,
  IdDocType,
  TimelineEvent,
  TimelineEventKind,
} from '@onefootprint/types';

import mergeAuditTrailTimelineEvents from './merge-audit-trail-timeline-events';

describe('mergeAuditTrailTimelineEvents', () => {
  it('when events are empty, should return empty array', () => {
    const events: TimelineEvent[] = [];
    const result = mergeAuditTrailTimelineEvents(events);
    expect(result).toEqual([]);
  });

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
            id: 'iddoc_hE3NxjPIrEdYifMWv0MeZB',
            timestamp: '2023-03-21T18:58:12.453172Z',
            status: DecryptedIdDocStatus.success,
            documentType: IdDocType.driversLicense,
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
            id: 'iddoc_hE3NxjPIrEdYifMWv0MeZB',
            timestamp: '2023-03-21T18:58:12.453172Z',
            status: DecryptedIdDocStatus.success,
            documentType: IdDocType.passport,
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
            id: 'iddoc_hE3NxjPIrEdYifMWv0MeZB',
            timestamp: '2023-03-21T18:58:12.453172Z',
            status: DecryptedIdDocStatus.success,
            documentType: IdDocType.driversLicense,
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
            id: 'iddoc_hE3NxjPIrEdYifMWv0MeZB',
            timestamp: '2023-03-21T18:58:12.453172Z',
            status: DecryptedIdDocStatus.success,
            documentType: IdDocType.passport,
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
            attributes: [CollectedKycDataOption.fullAddress],
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
              CollectedKycDataOption.fullAddress,
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
            id: 'iddoc_hE3NxjPIrEdYifMWv0MeZB',
            timestamp: '2023-03-21T18:58:12.453172Z',
            status: DecryptedIdDocStatus.success,
            documentType: IdDocType.driversLicense,
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
            attributes: [CollectedKycDataOption.fullAddress],
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
            id: 'iddoc_hE3NxjPIrEdYifMWv0MeZB',
            timestamp: '2023-03-21T18:58:12.453172Z',
            status: DecryptedIdDocStatus.success,
            documentType: IdDocType.driversLicense,
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
            attributes: [CollectedKycDataOption.fullAddress],
          },
        },
        isFromOtherOrg: true,
        time: { timestamp: '2021-03-03T00:00:00.000Z' },
      },
    ]);
  });
});
