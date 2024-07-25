import { mockRequest } from '@onefootprint/test-utils';
import type { OnboardingConfig } from '@onefootprint/types';
import { OnboardingConfigKind, OnboardingConfigStatus } from '@onefootprint/types';

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
  },
];

export const withPlaybooks = () =>
  mockRequest({
    method: 'get',
    path: '/org/onboarding_configs',
    response: {
      data: playbooksFixture,
      meta: {
        nextPage: 0,
        count: playbooksFixture.length,
      },
    },
  });

export const withPlaybooksError = () =>
  mockRequest({
    method: 'get',
    path: '/org/onboarding_configs',
    statusCode: 400,
    response: {
      message: 'Something went wrong',
    },
  });
