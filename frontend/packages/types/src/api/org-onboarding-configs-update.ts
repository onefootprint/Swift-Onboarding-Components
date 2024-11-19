import type { OnboardingConfig, OnboardingConfigStatus } from '../data';

export type OrgOnboardingConfigUpdateRequest = {
  id: string;
  name?: string;
  promptForPasskey?: boolean;
  status?: OnboardingConfigStatus;
};

export type OrgOnboardingConfigUpdateResponse = OnboardingConfig;
