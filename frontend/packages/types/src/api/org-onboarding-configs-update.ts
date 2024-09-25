import type { OnboardingConfig, OnboardingConfigStatus } from '../data';

export type OrgOnboardingConfigUpdateRequest = {
  id: string;
  name?: string;
  allowReonboard?: boolean;
  promptForPasskey?: boolean;
  status?: OnboardingConfigStatus;
};

export type OrgOnboardingConfigUpdateResponse = OnboardingConfig;
