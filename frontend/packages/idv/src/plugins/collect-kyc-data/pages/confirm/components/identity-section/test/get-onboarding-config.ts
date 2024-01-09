import type { PublicOnboardingConfig } from '@onefootprint/types';
import { OnboardingConfigStatus } from '@onefootprint/types';

const getOnboardingConfig = (): PublicOnboardingConfig => ({
  name: 'Acme Bank',
  orgName: 'Acme Bank',
  orgId: 'orgId',
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
