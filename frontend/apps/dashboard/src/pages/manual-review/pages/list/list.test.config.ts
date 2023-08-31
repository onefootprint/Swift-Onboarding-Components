import { mockRequest } from '@onefootprint/test-utils';
import {
  BusinessDI,
  CollectedKycDataOption,
  Entity,
  EntityKind,
  EntityStatus,
  GetOnboardingConfigsResponse,
  OnboardingConfigStatus,
} from '@onefootprint/types';

export const entitiesFixture: Entity[] = [
  {
    id: 'fp_bid_VXND11zUVRYQKKUxbUN3KD',
    isPortable: true,
    kind: EntityKind.business,
    attributes: [
      BusinessDI.city,
      BusinessDI.name,
      BusinessDI.website,
      BusinessDI.addressLine1,
      BusinessDI.phoneNumber,
      BusinessDI.zip,
      BusinessDI.country,
      BusinessDI.state,
      BusinessDI.tin,
    ],
    decryptableAttributes: [
      BusinessDI.city,
      BusinessDI.name,
      BusinessDI.website,
      BusinessDI.addressLine1,
      BusinessDI.phoneNumber,
      BusinessDI.zip,
      BusinessDI.country,
      BusinessDI.state,
      BusinessDI.tin,
    ],
    startTimestamp: '2023-03-27T14:43:47.444716Z',
    insightEvent: {
      timestamp: '2023-04-03T17:42:30.799202Z',
      ipAddress: '67.243.21.56',
      city: 'New York',
      country: 'United States',
      region: 'NY',
      regionName: 'New York',
      latitude: 40.7365,
      longitude: -74.0055,
      metroCode: '501',
      postalCode: '10014',
      timeZone: 'America/New_York',
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.2 Safari/605.1.15',
    },
    requiresManualReview: false,
    status: EntityStatus.pass,
    decryptedAttributes: {
      [BusinessDI.name]: 'Acme Inc.',
    },
    watchlistCheck: null,
  },
];

export const obConfigsFixture: GetOnboardingConfigsResponse = [
  {
    id: 'ob_config_id_7TU1EGLHwjoioStPuRyWpm',
    key: 'ob_live_wkkZyAbY92huSqp83SEOzw',
    name: 'User ID verification',
    orgName: 'Acme Inc.',
    logoUrl: null,
    privacyPolicyUrl: null,
    mustCollectData: [
      CollectedKycDataOption.name,
      CollectedKycDataOption.email,
      CollectedKycDataOption.fullAddress,
      CollectedKycDataOption.phoneNumber,
      CollectedKycDataOption.dob,
      CollectedKycDataOption.ssn9,
    ],
    canAccessData: [
      CollectedKycDataOption.name,
      CollectedKycDataOption.email,
      CollectedKycDataOption.fullAddress,
      CollectedKycDataOption.phoneNumber,
      CollectedKycDataOption.dob,
      CollectedKycDataOption.ssn9,
    ],
    isLive: true,
    createdAt: '2023-04-11T17:59:54.816474Z',
    status: OnboardingConfigStatus.enabled,
    optionalData: [],
    isAppClipEnabled: false,
    isNoPhoneFlow: false,
    allowInternationalResidents: false,
    isDocFirstFlow: false,
  },
];

export const withEntities = (response: Entity[] = entitiesFixture) =>
  mockRequest({
    method: 'get',
    path: '/entities',
    response: {
      data: response,
      meta: {},
    },
  });

export const withEntitiesError = () =>
  mockRequest({
    method: 'get',
    path: '/entities',
    statusCode: 400,
    response: {
      error: {
        message: 'Something went wrong',
      },
    },
  });

export const withOnboardingConfigs = (response = obConfigsFixture) =>
  mockRequest({
    method: 'get',
    path: '/org/onboarding_configs',
    response: {
      data: response,
      meta: {
        next: null,
        count: response.length,
      },
    },
  });
