import {
  type AmlCheck,
  AuthMethodKind,
  type OnboardingConfig,
  OnboardingConfigKind,
  OnboardingConfigStatus,
} from '@onefootprint/types';

export const onboardingConfigFixture: OnboardingConfig = {
  id: 'ob_config_id_sIrGC9qX1sdg6IH66kxwEd',
  name: 'Acme Inc. KYC (10/28/24)',
  key: 'pb_test_yfpnuqlV6oISBTVcaesYtO',
  isLive: false,
  createdAt: '2024-10-28T21:23:05.360166Z',
  mustCollectData: ['email', 'name', 'dob', 'full_address', 'phone_number', 'ssn9'],
  optionalData: [],
  allowInternationalResidents: false,
  internationalCountryRestrictions: null,
  allowUsResidents: true,
  allowUsTerritoryResidents: false,
  isNoPhoneFlow: false,
  isDocFirstFlow: false,
  skipConfirm: false,
  author: {
    kind: 'organization',
    member: 'Rafael Motta (rafael@onefootprint.com)',
  },
  kind: OnboardingConfigKind.kyc,
  isRulesEnabled: true,
  ruleSet: {
    version: 1,
  },
  status: OnboardingConfigStatus.enabled,
  documentsToCollect: [],
  businessDocumentsToCollect: [],
  verificationChecks: [
    {
      kind: 'kyc',
      data: {},
    },
    {
      kind: 'aml',
      data: {
        ofac: true,
        pep: true,
        adverseMedia: true,
        continuousMonitoring: true,
        adverseMediaLists: [
          'financial_crime',
          'violent_crime',
          'sexual_crime',
          'cyber_crime',
          'terrorism',
          'fraud',
          'narcotics',
          'general_serious',
          'general_minor',
        ],
        matchKind: 'fuzzy_low',
      },
    },
  ],
  requiredAuthMethods: [AuthMethodKind.phone],
  promptForPasskey: true,
};

export const amlCheck = ({
  adverseMedia = false,
  continuousMonitoring = false,
  ofac = false,
  pep = false,
}: {
  adverseMedia?: boolean;
  continuousMonitoring?: boolean;
  ofac?: boolean;
  pep?: boolean;
}) => {
  return { kind: 'aml', data: { adverseMedia, ofac, pep, continuousMonitoring } } as AmlCheck;
};
