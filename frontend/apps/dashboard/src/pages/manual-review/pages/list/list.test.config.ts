import { mockRequest } from '@onefootprint/test-utils';
import {
  AuthMethodKind,
  BusinessDI,
  CollectedKycDataOption,
  type Entity,
  EntityKind,
  EntityStatus,
  type GetOnboardingConfigsResponse,
  OnboardingConfigStatus,
} from '@onefootprint/types';
import { OnboardingConfigKind } from '@onefootprint/types/src/data/onboarding-config';

export const entitiesFixture: Entity[] = [
  {
    id: 'fp_bid_VXND11zUVRYQKKUxbUN3KD',
    isIdentifiable: true,
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
    data: [],
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
    decryptedAttributes: {
      [BusinessDI.name]: 'Acme Inc.',
    },
    watchlistCheck: null,
    hasOutstandingWorkflowRequest: false,
    label: null,
  },
];

export const obConfigsFixture: GetOnboardingConfigsResponse = [
  {
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
    isLive: true,
    createdAt: '2023-04-11T17:59:54.816474Z',
    status: OnboardingConfigStatus.enabled,
    optionalData: [],
    isNoPhoneFlow: false,
    allowInternationalResidents: false,
    isDocFirstFlow: false,
    allowUsResidents: true,
    internationalCountryRestrictions: null,
    allowUsTerritoryResidents: false,
    skipKyc: false,
    author: {
      kind: 'organization',
      member: 'Jane doe',
    },
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
    documentsToCollect: null,
    promptForPasskey: true,
    allowReonboard: false,
    businessDocumentsToCollect: [],
    requiredAuthMethods: [AuthMethodKind.phone],
    verificationChecks: [],
  },
];

export const withEntities = (response: Entity[] = entitiesFixture) =>
  mockRequest({
    method: 'post',
    path: '/entities/search',
    response: {
      data: response,
      meta: {},
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
