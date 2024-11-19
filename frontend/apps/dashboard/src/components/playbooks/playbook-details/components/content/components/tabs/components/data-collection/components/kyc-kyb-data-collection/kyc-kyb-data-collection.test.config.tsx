import {
  AuthMethodKind,
  DocumentRequestKind,
  type OnboardingConfig,
  OnboardingConfigKind,
  OnboardingConfigStatus,
} from '@onefootprint/types';

export const onboardingConfigFixture: OnboardingConfig = {
  id: 'ob_config_id_Vwyu5yLZbnXFwrC4RwFnDp',
  name: 'KYB',
  key: 'pb_test_u29z2AvnfqhGKpIb4f0raa',
  isLive: false,
  createdAt: '2024-01-02T20:12:20.301907Z',
  status: OnboardingConfigStatus.enabled,
  mustCollectData: [
    'email',
    'name',
    'dob',
    'full_address',
    'ssn9',
    'phone_number',
    'business_name',
    'business_address',
    'business_tin',
    'business_kyced_beneficial_owners',
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
  kind: OnboardingConfigKind.kyb,
  ruleSet: {
    version: 1,
  },
  documentsToCollect: null,
  promptForPasskey: true,
  businessDocumentsToCollect: [],
  requiredAuthMethods: [AuthMethodKind.phone],
  verificationChecks: [],
};

export const playbookFixtureWithBusinessAndKYCDocsFixture: OnboardingConfig = {
  ...onboardingConfigFixture,
  kind: OnboardingConfigKind.kyb,
  businessDocumentsToCollect: [
    {
      kind: DocumentRequestKind.Custom,
      data: {
        name: 'Business license',
        identifier: 'document.custom.business_license',
        requiresHumanReview: false,
        uploadSettings: 'prefer_upload',
      },
    },
  ],
  documentsToCollect: [
    {
      kind: DocumentRequestKind.ProofOfSsn,
      data: {
        requiresHumanReview: false,
      },
    },
  ],
};

export const playbookFixtureWithKYCForAllBusinessOwnersFixture: OnboardingConfig = {
  ...onboardingConfigFixture,
  kind: OnboardingConfigKind.kyb,
  mustCollectData: [
    'email',
    'name',
    'dob',
    'full_address',
    'phone_number',
    'ssn9',
    'business_name',
    'business_tin',
    'business_kyced_beneficial_owners',
    'business_address',
  ],
};
