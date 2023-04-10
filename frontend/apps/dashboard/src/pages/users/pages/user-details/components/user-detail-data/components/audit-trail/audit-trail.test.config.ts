import { mockRequest } from '@onefootprint/test-utils';
import {
  CollectedKycDataOption,
  DecisionSourceKind,
  DecisionStatus,
  IdDI,
  LivenessIssuer,
  LivenessSource,
  OnboardingStatus,
  RoleScope,
  ScopedUser,
  Timeline,
  TimelineEventKind,
  Vendor,
} from '@onefootprint/types';

export const timelineFixture: Timeline = [
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

export const withTimeline = (userId: string, data = timelineFixture) =>
  mockRequest({
    method: 'get',
    path: `/entities/${userId}/timeline`,
    response: { data },
  });

export const userFixture: ScopedUser = {
  id: 'fp_id_rybIhIjSPky1yEZ7u77cok',
  isPortable: true,
  attributes: [
    IdDI.email,
    IdDI.firstName,
    IdDI.lastName,
    IdDI.phoneNumber,
    IdDI.dob,
    IdDI.ssn4,
    IdDI.ssn9,
    IdDI.country,
    IdDI.city,
    IdDI.state,
    IdDI.addressLine1,
    IdDI.zip,
  ],
  identityDocumentInfo: [],
  startTimestamp: '2023-02-04T00:02:09.690721Z',
  onboarding: {
    id: 'ob_HpQ61LblrLgXnx764kaE8F',
    isAuthorized: true,
    name: 'User ID verification',
    configId: 'ob_config_id_HPuJsnhKSX4GwuK6FXG9F3',
    requiresManualReview: false,
    status: OnboardingStatus.pass,
    timestamp: '2023-02-04T00:02:12.743759Z',
    isLivenessSkipped: false,
    insightEvent: {
      timestamp: '2023-02-04T00:02:12.731594Z',
      ipAddress: '76.27.42.222',
      city: 'Sandy',
      country: 'United States',
      region: 'UT',
      regionName: 'Utah',
      latitude: 40.576,
      longitude: -111.8788,
      metroCode: '770',
      postalCode: '84070',
      timeZone: 'America/Denver',
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
    },
    canAccessData: [
      CollectedKycDataOption.name,
      CollectedKycDataOption.dob,
      CollectedKycDataOption.ssn4,
      CollectedKycDataOption.ssn9,
      CollectedKycDataOption.fullAddress,
      CollectedKycDataOption.email,
      CollectedKycDataOption.phoneNumber,
    ],
    canAccessAttributes: [
      IdDI.email,
      IdDI.firstName,
      IdDI.lastName,
      IdDI.addressLine1,
      IdDI.city,
      IdDI.zip,
      IdDI.country,
      IdDI.phoneNumber,
      IdDI.dob,
      IdDI.ssn4,
      IdDI.ssn9,
    ],
    canAccessPermissions: [RoleScope.decryptEmail],
    latestDecision: {
      id: 'decision_sjlbjqkdSFdShDCiPHgK6K',
      status: DecisionStatus.pass,
      timestamp: new Date('2023-02-04T00:02:48.954578Z'),
      source: {
        kind: DecisionSourceKind.footprint,
      },
      vendors: [],
      obConfiguration: {
        mustCollectData: [],
        mustCollectIdentityDocument: false,
      },
    },
  },
  orderingId: 7076,
};

export const withUser = (userId: string, response: ScopedUser = userFixture) =>
  mockRequest({
    method: 'get',
    path: `/users/${userId}`,
    response,
  });
