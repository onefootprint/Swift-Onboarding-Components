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
  isNoPhoneFlow: false,
  privacyPolicyUrl: null,
  requiresIdDoc: false,
  key: 'key',
  isKyb: false,
});

export default getOnboardingConfig;
