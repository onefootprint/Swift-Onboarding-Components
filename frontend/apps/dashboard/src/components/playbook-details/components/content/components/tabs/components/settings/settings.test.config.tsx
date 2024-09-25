import { mockRequest } from '@onefootprint/test-utils';
import {
  AuthMethodKind,
  CollectedKycDataOption,
  type OnboardingConfig,
  OnboardingConfigKind,
  OnboardingConfigStatus,
} from '@onefootprint/types';

export const playbookWithPasskeysFixture: OnboardingConfig = {
  author: {
    kind: 'organization',
    member: 'Jane doe',
  },
  allowInternationalResidents: false,
  allowUsResidents: true,
  allowUsTerritoryResidents: false,
  appearance: undefined,
  canAccessData: [],
  createdAt: '',
  enhancedAml: {
    enhancedAml: false,
    ofac: false,
    pep: false,
    adverseMedia: false,
  },
  id: 'ob_config_id_7TU1EGLHwjoioStPuRyWpm',
  internationalCountryRestrictions: null,
  isDocFirstFlow: false,
  isLive: false,
  isNoPhoneFlow: false,
  key: 'ob_config_pk_9VSl6Z7Ax9IQRIFkihw4lm',
  kind: OnboardingConfigKind.kyc,
  mustCollectData: [CollectedKycDataOption.name],
  name: 'Test playbook',
  optionalData: [],
  skipKyc: false,
  status: OnboardingConfigStatus.enabled,
  ruleSet: {
    version: 1,
  },
  documentsToCollect: null,
  promptForPasskey: true,
  allowReonboard: false,
  businessDocumentsToCollect: [],
  requiredAuthMethods: [AuthMethodKind.phone],
  verificationChecks: [],
};

export const playbookWithoutPasskeysFixture: OnboardingConfig = {
  ...playbookWithPasskeysFixture,
  promptForPasskey: false,
};

export const withUpdatePlaybook = (onboardingConfig: Partial<OnboardingConfig>) =>
  mockRequest({
    method: 'patch',
    path: `/org/onboarding_configs/${onboardingConfig.id}`,
    response: {
      onboardingConfig,
    },
  });

export const withUpdatePlaybookError = (onboardingConfig: Partial<OnboardingConfig>) =>
  mockRequest({
    method: 'patch',
    path: `/org/onboarding_configs/${onboardingConfig.id}`,
    statusCode: 400,
    response: {
      message: 'Something went wrong',
    },
  });
