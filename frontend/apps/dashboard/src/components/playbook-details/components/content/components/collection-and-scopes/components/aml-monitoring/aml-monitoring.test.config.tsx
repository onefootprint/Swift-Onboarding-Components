import {
  type OnboardingConfig,
  OnboardingConfigKind,
  OnboardingConfigStatus,
} from '@onefootprint/types';

const onboardingConfig: OnboardingConfig = {
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
    'business_beneficial_owners',
  ],
  optionalData: [],
  canAccessData: [
    'email',
    'phone_number',
    'name',
    'dob',
    'full_address',
    'ssn9',
    'business_name',
    'business_address',
    'business_tin',
    'business_beneficial_owners',
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
  kind: OnboardingConfigKind.kyb,
  ruleSet: {
    version: 1,
  },
};

export default onboardingConfig;
