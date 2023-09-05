import {
  OnboardingConfigStatus,
  PublicOnboardingConfig,
} from '@onefootprint/types';

const getOnboardingConfig = (): PublicOnboardingConfig => ({
  name: 'Acme Bank',
  orgName: 'Acme Bank',
  logoUrl: null,
  isLive: true,
  status: OnboardingConfigStatus.enabled,
  isAppClipEnabled: false,
  isInstantAppEnabled: false,
  appClipExperienceId: 'app_exp_9KlTyouGLSNKMgJmpUdBAF',
  isNoPhoneFlow: false,
  privacyPolicyUrl: null,
  requiresIdDoc: false,
  key: 'key',
  isKyb: false,
  allowInternationalResidents: false,
});

export default getOnboardingConfig;
