import {
  CollectedKycDataOption,
  DecisionSourceKind,
  DecisionStatus,
  LivenessIssuer,
  LivenessSource,
  Timeline,
  TimelineEventKind,
  Vendor,
} from '@onefootprint/types';

const TimelineFixture: Timeline = [
  {
    event: {
      kind: TimelineEventKind.dataCollected,
      data: {
        attributes: [
          CollectedKycDataOption.name,
          CollectedKycDataOption.dob,
          CollectedKycDataOption.ssn9,
          CollectedKycDataOption.fullAddress,
          CollectedKycDataOption.email,
          CollectedKycDataOption.phoneNumber,
        ],
      },
    },
    timestamp: '2022-11-08T20:21:33.931738Z',
  },
  {
    event: {
      kind: TimelineEventKind.liveness,
      data: {
        source: LivenessSource.skipped,
        attributes: {
          issuers: [LivenessIssuer.google, LivenessIssuer.apple],
          device: 'iPhone 14',
          os: 'iOS',
        },
        insightEvent: {
          timestamp: '2022-11-08T20:21:49.971354Z',
          ipAddress: '104.28.39.72',
          city: 'Nashua',
          country: 'United States',
          region: 'NH',
          regionName: 'New Hampshire',
          latitude: 42.7628,
          longitude: -71.4674,
          metroCode: '506',
          postalCode: '03061',
          timeZone: 'America/New_York',
          userAgent:
            'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
        },
      },
    },
    timestamp: '2022-11-08T20:21:49.979139Z',
  },
  {
    event: {
      kind: TimelineEventKind.onboardingDecision,
      data: {
        decision: {
          id: 'decision_mxioMGjVUQJhbemA20OFi3',
          status: DecisionStatus.pass,
          timestamp: new Date('2022-11-08T20:21:53.750904Z'),
          source: {
            kind: DecisionSourceKind.footprint,
          },
          obConfiguration: {
            mustCollectData: [
              CollectedKycDataOption.name,
              CollectedKycDataOption.dob,
              CollectedKycDataOption.ssn9,
              CollectedKycDataOption.fullAddress,
              CollectedKycDataOption.email,
              CollectedKycDataOption.phoneNumber,
            ],
            mustCollectIdentityDocument: false,
          },
          vendors: [Vendor.idology],
        },
        annotation: null,
      },
    },
    timestamp: '2022-11-08T20:21:53.752388Z',
  },
  {
    event: {
      kind: TimelineEventKind.onboardingDecision,
      data: {
        decision: {
          id: 'decision_kaI2ycxFAND4MpzdsYw64I',
          status: DecisionStatus.stepUpRequired,
          timestamp: new Date('2022-11-08T20:21:53.769699Z'),
          source: {
            kind: DecisionSourceKind.footprint,
          },
          obConfiguration: {
            mustCollectData: [
              CollectedKycDataOption.name,
              CollectedKycDataOption.dob,
              CollectedKycDataOption.ssn9,
              CollectedKycDataOption.fullAddress,
              CollectedKycDataOption.email,
              CollectedKycDataOption.phoneNumber,
            ],
            mustCollectIdentityDocument: false,
          },
          vendors: [Vendor.idology],
        },
        annotation: null,
      },
    },
    timestamp: '2022-11-08T20:21:53.771495Z',
  },
];

export default TimelineFixture;
