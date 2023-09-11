import type { PublicOnboardingConfig } from '@onefootprint/types';
import { OnboardingConfigStatus } from '@onefootprint/types';

const getOnboardingConfig = (): PublicOnboardingConfig => ({
  isLive: true,
  logoUrl: 'url',
  privacyPolicyUrl: 'url',
  name: 'tenant',
  orgName: 'tenantOrg',
  status: OnboardingConfigStatus.enabled,
  isAppClipEnabled: false,
  isInstantAppEnabled: false,
  appClipExperienceId: 'app_exp_9KlTyouGLSNKMgJmpUdBAF',
  isNoPhoneFlow: false,
  requiresIdDoc: false,
  key: 'key',
  isKyb: false,
  allowInternationalResidents: false,
});

export default getOnboardingConfig;
