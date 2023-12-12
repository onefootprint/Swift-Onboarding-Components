import { mockRequest } from '@onefootprint/test-utils';
import type { Entity, GetOnboardingConfigsResponse } from '@onefootprint/types';
import {
  CollectedKycDataOption,
  EntityKind,
  EntityStatus,
  IdDI,
  OnboardingConfigStatus,
} from '@onefootprint/types';
import { OnboardingConfigKind } from '@onefootprint/types/src/data/onboarding-config';

export const entitiesFixture: Entity[] = [
  {
    id: 'fp_bid_VXND11zUVRYQKKUxbUN3KD',
    isPortable: true,
    kind: EntityKind.person,
    data: [],
    attributes: [IdDI.firstName, IdDI.lastName, IdDI.email],
    decryptableAttributes: [IdDI.firstName, IdDI.lastName, IdDI.email],
    startTimestamp: '2023-03-27T14:43:47.444716Z',
    lastActivityAt: '2023-03-27T14:43:47.444716Z',
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
    decryptedAttributes: {},
    watchlistCheck: null,
    hasOutstandingWorkflowRequest: false,
  },
  {
    id: 'fp_id_tvfUNdGqmk2kJyyka9gX22',
    isPortable: true,
    kind: EntityKind.person,
    data: [],
    attributes: [IdDI.firstName, IdDI.lastName, IdDI.email],
    decryptableAttributes: [IdDI.firstName, IdDI.lastName, IdDI.email],
    startTimestamp: '2023-10-19T03:38:23.521861Z',
    lastActivityAt: '2023-10-19T03:38:23.521861Z',
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
    status: EntityStatus.failed,
    decryptedAttributes: {},
    watchlistCheck: null,
    hasOutstandingWorkflowRequest: false,
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
