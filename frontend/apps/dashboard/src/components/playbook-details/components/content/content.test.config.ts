import type { OnboardingConfig } from '@onefootprint/types';
import { AuthMethodKind, OnboardingConfigKind, OnboardingConfigStatus, SupportedIdDocTypes } from '@onefootprint/types';

const basePlaybook: OnboardingConfig = {
  id: '1',
  name: 'Base Playbook',
  key: 'base-playbook',
  isLive: true,
  createdAt: '2023-01-01T00:00:00Z',
  status: OnboardingConfigStatus.enabled,
  mustCollectData: ['name'],
  canAccessData: ['email'],
  optionalData: [],
  isNoPhoneFlow: false,
  allowUsResidents: true,
  allowInternationalResidents: false,
  internationalCountryRestrictions: null,
  allowUsTerritoryResidents: true,
  isDocFirstFlow: false,
  enhancedAml: {
    enhancedAml: true,
    ofac: true,
    pep: false,
    adverseMedia: false,
  },
  skipKyc: false,
  kind: OnboardingConfigKind.kyc,
  author: {
    kind: 'user',
    member: 'john.doe@example.com',
  },
  requiredAuthMethods: [AuthMethodKind.email],
  documentsToCollect: [],
  businessDocumentsToCollect: null,
  promptForPasskey: false,
  allowReonboard: false,
  ruleSet: {
    version: 1,
  },
  verificationChecks: [],
};

export const kycPlaybookFixture: OnboardingConfig = {
  ...basePlaybook,
  kind: OnboardingConfigKind.kyc,
};

export const kybPlaybookFixture: OnboardingConfig = {
  ...basePlaybook,
  kind: OnboardingConfigKind.kyb,
};

export const authPlaybookFixture: OnboardingConfig = {
  ...basePlaybook,
  kind: OnboardingConfigKind.auth,
};

export const docPlaybookFixture: OnboardingConfig = {
  ...basePlaybook,
  kind: OnboardingConfigKind.document,
  documentTypesAndCountries: {
    global: [SupportedIdDocTypes.passport, SupportedIdDocTypes.idCard, SupportedIdDocTypes.driversLicense],
    countrySpecific: {
      US: [SupportedIdDocTypes.passport, SupportedIdDocTypes.idCard, SupportedIdDocTypes.driversLicense],
      IR: [SupportedIdDocTypes.passport, SupportedIdDocTypes.idCard, SupportedIdDocTypes.driversLicense],
    },
  },
};
