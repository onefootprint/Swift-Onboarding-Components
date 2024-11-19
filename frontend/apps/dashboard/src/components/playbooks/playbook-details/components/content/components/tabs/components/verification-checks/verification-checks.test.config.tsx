import { getOnboardingConfiguration } from '@onefootprint/fixtures/dashboard';

export const onboardingConfigFixture = getOnboardingConfiguration({
  kind: 'kyc',
  mustCollectData: ['email', 'name', 'dob', 'full_address', 'phone_number', 'ssn9'],
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
});

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
  return { kind: 'aml', data: { adverseMedia, ofac, pep, continuousMonitoring } };
};
