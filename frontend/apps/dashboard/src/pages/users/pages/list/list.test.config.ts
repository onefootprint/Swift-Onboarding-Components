import { mockRequest } from '@onefootprint/test-utils';
import type { Entity, GetOnboardingConfigsResponse } from '@onefootprint/types';
import { CollectedKycDataOption, EntityKind, EntityStatus, IdDI, OnboardingConfigStatus } from '@onefootprint/types';
import { OnboardingConfigKind } from '@onefootprint/types/src/data/onboarding-config';

export const entitiesFixture: Entity[] = [
  {
    id: 'fp_bid_VXND11zUVRYQKKUxbUN3KD',
    isIdentifiable: true,
    kind: EntityKind.person,
    data: [],
    attributes: [IdDI.firstName, IdDI.lastName, IdDI.email],
    decryptableAttributes: [IdDI.firstName, IdDI.lastName, IdDI.email],
    startTimestamp: '2023-03-27T14:43:47.444716Z',
    lastActivityAt: '2023-03-27T14:43:47.444716Z',
    workflows: [
      {
        createdAt: '2023-03-27T14:43:47.444716Z',
        playbookId: 'ob_config_id_3o5SdynZVGO1icDm8Z6llC',
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
      },
    ],
    requiresManualReview: false,
    status: EntityStatus.pass,
    decryptedAttributes: {},
    watchlistCheck: null,
    hasOutstandingWorkflowRequest: false,
    label: null,
  },
  {
    id: 'fp_id_tvfUNdGqmk2kJyyka9gX22',
    isIdentifiable: true,
    kind: EntityKind.person,
    data: [],
    attributes: [IdDI.firstName, IdDI.lastName, IdDI.email],
    decryptableAttributes: [IdDI.firstName, IdDI.lastName, IdDI.email],
    startTimestamp: '2023-10-19T03:38:23.521861Z',
    lastActivityAt: '2023-10-19T03:38:23.521861Z',
    workflows: [
      {
        createdAt: '2023-03-27T14:43:47.444716Z',
        playbookId: 'ob_config_id_3o5SdynZVGO1icDm8Z6llC',
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
      },
    ],
    requiresManualReview: false,
    status: EntityStatus.failed,
    decryptedAttributes: {},
    watchlistCheck: null,
    hasOutstandingWorkflowRequest: false,
    label: null,
  },
];

export const obConfigsFixture: GetOnboardingConfigsResponse = [
  {
    author: {
      kind: 'organization',
      member: 'Jane doe',
    },
    id: 'ob_config_id_7TU1EGLHwjoioStPuRyWpm',
    key: 'pb_live_wkkZyAbY92huSqp83SEOzw',
    name: 'User ID verification',
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
    isNoPhoneFlow: false,
    allowInternationalResidents: false,
    allowUsTerritoryResidents: true,
    skipKyc: true,
    isDocFirstFlow: false,
    allowUsResidents: true,
    internationalCountryRestrictions: null,
    enhancedAml: {
      enhancedAml: false,
      ofac: false,
      pep: false,
      adverseMedia: false,
    },
    kind: OnboardingConfigKind.kyc,
    ruleSet: {
      version: 1,
    },
  },
];

export const withEntities = (response: Entity[] = entitiesFixture) =>
  mockRequest({
    method: 'post',
    path: '/entities/search',
    response: {
      data: response,
      meta: {
        next: null,
        count: response.length,
      },
    },
  });

export const withEntitiesError = () =>
  mockRequest({
    method: 'post',
    path: '/entities/search',
    statusCode: 400,
    response: {
      message: 'Something went wrong',
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
