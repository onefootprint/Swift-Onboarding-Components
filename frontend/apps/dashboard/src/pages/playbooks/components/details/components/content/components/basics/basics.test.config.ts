import type { OnboardingConfig } from '@onefootprint/types';
import {
  CollectedKycDataOption,
  OnboardingConfigStatus,
} from '@onefootprint/types';

const playbookFixture: OnboardingConfig = {
  id: 'test id',
  name: 'Lucas Playbook',
  key: 'ob_config_pk_9VSl6Z7Ax9IQRIFkihw4lm',
  isLive: false,
  createdAt: '',
  appearance: undefined,

  orgName: 'Acme Bank',
  logoUrl: null,
  privacyPolicyUrl: null,

  status: OnboardingConfigStatus.enabled,
  isNoPhoneFlow: false,
  mustCollectData: [CollectedKycDataOption.name],
  optionalData: [],
  canAccessData: [],
  isAppClipEnabled: false,
  appClipExperienceId: 'app_exp_9KlTyouGLSNKMgJmpUdBAF',
  isInstantAppEnabled: false,
  allowInternationalResidents: false,
  isDocFirstFlow: false,
  allowUsResidents: true,
  internationalCountryRestrictions: null,
  enhancedAml: {
    enhancedAml: true,
    ofac: true,
    pep: true,
    adverseMedia: true,
  },
};

export default playbookFixture;
