import { getOnboardingConfiguration } from '@onefootprint/fixtures/dashboard';
import type { OnboardingConfiguration } from '@onefootprint/request-types/dashboard';

export const kycPlaybookFixture: OnboardingConfiguration = {
  ...getOnboardingConfiguration({
    id: '1',
    name: 'Base Playbook',
  }),
  kind: 'kyc',
  documentsToCollect: [],
};

export const kybPlaybookFixture: OnboardingConfiguration = {
  ...getOnboardingConfiguration({
    id: '1',
    name: 'Base Playbook',
  }),
  kind: 'kyb',
  documentsToCollect: [],
  businessDocumentsToCollect: [],
};

export const authPlaybookFixture: OnboardingConfiguration = {
  ...getOnboardingConfiguration({
    id: '1',
    name: 'Base Playbook',
  }),
  kind: 'auth',
  documentsToCollect: [],
};

export const docPlaybookFixture: OnboardingConfiguration = {
  ...getOnboardingConfiguration({
    id: '1',
    name: 'Base Playbook',
  }),
  kind: 'document',
  documentTypesAndCountries: {
    countrySpecific: {
      US: ['passport', 'id_card', 'drivers_license'],
      IR: ['passport', 'id_card', 'drivers_license'],
    },
    global: ['passport', 'id_card', 'drivers_license'],
  },
  documentsToCollect: [],
};
