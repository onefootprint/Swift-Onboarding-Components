import {
  OnboardingConfigStatus,
  PublicOnboardingConfig,
} from '@onefootprint/types';

const getOnboardingConfig = (): PublicOnboardingConfig => ({
  isLive: true,
  logoUrl: 'url',
  privacyPolicyUrl: 'url',
  name: 'tenant',
  orgName: 'tenantOrg',
  status: OnboardingConfigStatus.enabled,
  isAppClipEnabled: false,
  isNoPhoneFlow: false,
  requiresIdDoc: false,
  key: 'key',
  isKyb: false,
});

export default getOnboardingConfig;
