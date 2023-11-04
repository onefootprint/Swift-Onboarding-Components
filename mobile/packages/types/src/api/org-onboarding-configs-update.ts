import type { OnboardingConfig } from '../data';

export type OrgOnboardingConfigUpdateRequest = Partial<OnboardingConfig> & {
  id: string;
};

export type OrgOnboardingConfigUpdateResponse = OnboardingConfig;
