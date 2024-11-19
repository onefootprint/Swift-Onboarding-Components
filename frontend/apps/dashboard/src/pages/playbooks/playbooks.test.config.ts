import { mockRequest } from '@onefootprint/test-utils';
import {
  AuthMethodKind,
  type OnboardingConfig,
  OnboardingConfigKind,
  OnboardingConfigStatus,
} from '@onefootprint/types';

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
    kind: OnboardingConfigKind.kyc,
    ruleSet: {
      version: 1,
    },
    documentsToCollect: null,
    promptForPasskey: true,
    businessDocumentsToCollect: [],
    requiredAuthMethods: [AuthMethodKind.phone],
    verificationChecks: [],
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
    kind: OnboardingConfigKind.kyb,
    ruleSet: {
      version: 1,
    },
    documentsToCollect: null,
    promptForPasskey: true,
    businessDocumentsToCollect: [],
    requiredAuthMethods: [AuthMethodKind.phone],
    verificationChecks: [],
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
    kind: OnboardingConfigKind.auth,
    ruleSet: {
      version: 1,
    },
    documentsToCollect: null,
    promptForPasskey: true,
    businessDocumentsToCollect: [],
    requiredAuthMethods: [AuthMethodKind.phone],
    verificationChecks: [],
  },
];

export const withPlaybooks = () =>
  mockRequest({
    method: 'get',
    path: '/org/playbooks',
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
    path: '/org/playbooks',
    statusCode: 400,
    response: {
      message: 'Something went wrong',
    },
  });
