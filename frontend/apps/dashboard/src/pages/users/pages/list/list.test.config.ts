import { mockRequest } from '@onefootprint/test-utils';
import type { Entity, GetOnboardingConfigsResponse } from '@onefootprint/types';
import {
  BusinessDI,
  CollectedKycDataOption,
  EntityKind,
  EntityStatus,
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
      timestamp: '2023-03-29T23:07:46.850237Z',
      ipAddress: '73.222.157.30',
      city: 'San Francisco',
      country: 'United States',
      region: 'CA',
      regionName: 'California',
      latitude: 37.7595,
      longitude: -122.4367,
      metroCode: '807',
      postalCode: '94114',
      timeZone: 'America/Los_Angeles',
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
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
      CollectedKycDataOption.address,
      CollectedKycDataOption.phoneNumber,
      CollectedKycDataOption.dob,
      CollectedKycDataOption.ssn9,
    ],
    canAccessData: [
      CollectedKycDataOption.name,
      CollectedKycDataOption.email,
      CollectedKycDataOption.address,
      CollectedKycDataOption.phoneNumber,
      CollectedKycDataOption.dob,
      CollectedKycDataOption.ssn9,
    ],
    optionalData: [],
    isLive: true,
    createdAt: '2023-04-11T17:59:54.816474Z',
    status: OnboardingConfigStatus.enabled,
    isAppClipEnabled: false,
    isInstantAppEnabled: false,
    appClipExperienceId: 'app_exp_9KlTyouGLSNKMgJmpUdBAF',
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
