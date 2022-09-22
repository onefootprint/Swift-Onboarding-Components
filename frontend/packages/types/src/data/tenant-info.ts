import { OnboardingConfig } from './onboarding-config';

export type TenantInfo = Pick<
  OnboardingConfig,
  'canAccessData' | 'isLive' | 'mustCollectData' | 'name' | 'orgName'
> & { pk: string };
