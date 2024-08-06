import { mockRequest } from '@onefootprint/test-utils';
import {
  AuthMethodKind,
  type OnboardingConfig,
  OnboardingConfigKind,
  OnboardingConfigStatus,
  type OrgMetricsResponse,
} from '@onefootprint/types/src/data';

export const orgMetricsFixture = {
  user: {
    newVaults: 8910,
    totalOnboardings: 1058814,
    passOnboardings: 1036817,
    failOnboardings: 17187,
    incompleteOnboardings: 4810,
  },
  business: {
    newVaults: 30,
    totalOnboardings: 20,
    passOnboardings: 11,
    failOnboardings: 4,
    incompleteOnboardings: 5,
  },
};

export const emptyOrgMetricsFixture = {
  user: {
    newVaults: 0,
    totalOnboardings: 0,
    passOnboardings: 0,
    failOnboardings: 0,
    incompleteOnboardings: 0,
  },
  business: {
    newVaults: 0,
    totalOnboardings: 0,
    passOnboardings: 0,
    failOnboardings: 0,
    incompleteOnboardings: 0,
  },
};

export const playbooksFixture: OnboardingConfig[] = [
  {
    id: 'ob_config_id_LZuy8k6ch31LcTEZvyk7YX',
    name: 'Playbook KYC',
    key: 'ob_test_gc1cmZRQoF4MAWGVegTh6T',
    isLive: false,
    createdAt: '2023-10-26T16:52:52.535896Z',
    status: OnboardingConfigStatus.enabled,
    mustCollectData: [
      'email',
      'name',
      'dob',
      'full_address',
      'us_legal_status',
      'ssn9',
      'phone_number',
      'document.drivers_license,id_card,passport.none.require_selfie',
    ],
    optionalData: [],
    canAccessData: [
      'email',
      'phone_number',
      'name',
      'dob',
      'full_address',
      'ssn9',
      'us_legal_status',
      'document.drivers_license,id_card,passport.none.require_selfie',
    ],
    allowInternationalResidents: false,
    internationalCountryRestrictions: null,
    allowUsResidents: true,
    allowUsTerritoryResidents: false,
    isNoPhoneFlow: false,
    isDocFirstFlow: false,
    author: {
      kind: 'organization',
      member: 'John Doe (john.doe@acme.com)',
    },
    skipKyc: false,
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
    businessDocumentsToCollect: [],
    requiredAuthMethods: [AuthMethodKind.phone],
  },
  {
    id: 'ob_config_id_Vwyu5yLZbnXFwrC4RwFnDp',
    name: 'Playbook KYB',
    key: 'ob_test_Y8Uzs96q0DgTehYdKI14f9',
    isLive: false,
    createdAt: '2023-10-27T21:50:30.888391Z',
    status: OnboardingConfigStatus.enabled,
    mustCollectData: ['business_name', 'business_tin', 'business_address'],
    optionalData: [],
    canAccessData: ['business_name', 'business_tin', 'business_address'],
    allowInternationalResidents: false,
    internationalCountryRestrictions: null,
    allowUsResidents: true,
    allowUsTerritoryResidents: false,
    isNoPhoneFlow: false,
    isDocFirstFlow: false,
    author: {
      kind: 'organization',
      member: 'Jane Doe (jane.doe@acme.com)',
    },
    skipKyc: false,
    enhancedAml: {
      enhancedAml: false,
      ofac: false,
      pep: false,
      adverseMedia: false,
    },
    kind: OnboardingConfigKind.kyb,
    ruleSet: {
      version: 1,
    },
    documentsToCollect: null,
    promptForPasskey: true,
    businessDocumentsToCollect: [],
    requiredAuthMethods: [AuthMethodKind.phone],
  },
  {
    id: 'ob_config_id_m35ER0O2UEaAOHyZa0oAKR',
    name: 'Playbook Auth',
    key: 'ob_test_QhzzskOCGDZjvIKNzx91tY',
    isLive: false,
    createdAt: '2023-10-26T06:14:52.224525Z',
    status: OnboardingConfigStatus.enabled,
    mustCollectData: ['email', 'phone_number'],
    optionalData: [],
    canAccessData: ['email', 'phone_number'],
    allowInternationalResidents: false,
    internationalCountryRestrictions: null,
    allowUsResidents: true,
    allowUsTerritoryResidents: false,
    isNoPhoneFlow: false,
    isDocFirstFlow: false,
    author: {
      kind: 'organization',
      member: 'Jane Doe (jane.doe@acme.com)',
    },
    skipKyc: false,
    enhancedAml: {
      enhancedAml: false,
      ofac: false,
      pep: false,
      adverseMedia: false,
    },
    kind: OnboardingConfigKind.auth,
    ruleSet: {
      version: 1,
    },
    documentsToCollect: null,
    promptForPasskey: true,
    businessDocumentsToCollect: [],
    requiredAuthMethods: [AuthMethodKind.phone],
  },
];

export const withOrgMetrics = (response: OrgMetricsResponse = orgMetricsFixture) =>
  mockRequest({
    method: 'get',
    path: '/org/metrics',
    response,
  });

export const withOrgMetricsError = () =>
  mockRequest({
    method: 'get',
    path: '/org/metrics',
    statusCode: 400,
    response: {
      message: 'Something went wrong',
    },
  });

export const withPlaybooks = (response: OnboardingConfig[] = playbooksFixture) =>
  mockRequest({
    method: 'get',
    path: '/org/onboarding_configs',
    response,
  });
